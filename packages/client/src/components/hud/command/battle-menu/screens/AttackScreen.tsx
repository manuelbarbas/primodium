import { Navigator } from "@/components/core/Navigator";
import { Entity } from "@primodiumxyz/reactive-tables";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { InterfaceIcons } from "@primodiumxyz/assets";
import React, { useMemo } from "react";
import { EFleetStance } from "contracts/config/enums";
import { Button } from "@/components/core/Button";
import { FaInfoCircle } from "react-icons/fa";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { alert } from "@/util/alert";
import { useGame } from "@/hooks/useGame";
import { useCore, useOrbitingFleets } from "@primodiumxyz/core/react";
import { entityToFleetName, entityToRockName, formatTime } from "@primodiumxyz/core";
import { useContractCalls } from "@/hooks/useContractCalls";

export const Fleet: React.FC<{ fleetEntity: Entity; target: Entity; willFriendlyFire: boolean }> = ({
  fleetEntity,
  target,
  willFriendlyFire,
}) => {
  const game = useGame();
  const { tables } = useCore();
  const { clearFleetStance, attack } = useContractCalls();
  const movement = tables.FleetMovement.use(fleetEntity);
  const stance = tables.FleetStance.use(fleetEntity);
  const fleetCooldown = tables.CooldownEnd.use(fleetEntity)?.value ?? 0n;
  const now = tables.Time.use()?.value ?? 0n;
  const inCooldown = fleetCooldown > now;
  const isFleetEmpty = !!tables.IsFleetEmpty.use(fleetEntity)?.value;

  const fleetStateText = useMemo(() => {
    if (stance && stance?.stance === EFleetStance.Follow)
      return `Following ${entityToFleetName(stance.target as Entity)}`;
    if (stance?.stance === EFleetStance.Block) return "Blocking";
    if (stance?.stance === EFleetStance.Defend) return "Defending";
    return "Orbiting";
  }, [stance]);

  return (
    <SecondaryCard
      className="flex-row justify-between gap-10 items-center"
      onPointerEnter={() =>
        tables.HoverEntity.set({
          value: fleetEntity,
        })
      }
      onPointerLeave={() => tables.HoverEntity.remove()}
    >
      <div className="flex gap-2">
        <IconLabel imageUri={InterfaceIcons.Fleet} />
        <div>
          <p className="text-sm">{entityToFleetName(fleetEntity)}</p>
          <p className="opacity-75 text-xs">{`${fleetStateText} ${entityToRockName(
            movement?.destination as Entity
          )}`}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        {isFleetEmpty && (
          <Button size="sm" variant="error" disabled>
            NO UNITS
          </Button>
        )}
        {inCooldown && !isFleetEmpty && (
          <Button size="sm" variant="error" disabled>
            IN COOLDOWN
          </Button>
        )}
        {stance?.stance && !inCooldown && !isFleetEmpty && (
          <TransactionQueueMask queueItemId={"FleetStance" as Entity}>
            <Button size="sm" variant="info" onClick={() => clearFleetStance(fleetEntity)}>
              Clear Stance
            </Button>
          </TransactionQueueMask>
        )}
        {!inCooldown && !isFleetEmpty && !stance?.stance && (
          <TransactionQueueMask queueItemId={`attack-${fleetEntity}`}>
            <Button
              size="sm"
              variant="error"
              onClick={() =>
                willFriendlyFire
                  ? alert(
                      "You have defending fleets protecting this asteroid. Attacking this asteroid fleet will initiate friendly fire! Are you sure you want to proceed?",
                      () => attack(fleetEntity, target),
                      game
                    )
                  : attack(fleetEntity, target)
              }
            >
              SELECT
            </Button>
          </TransactionQueueMask>
        )}
        {inCooldown && <p className="text-xs opacity-75">COOLDOWN {formatTime(fleetCooldown - now)}</p>}
      </div>
    </SecondaryCard>
  );
};

export const AttackScreen: React.FC<{ selectedRock: Entity; target: Entity }> = ({ selectedRock, target }) => {
  const { tables } = useCore();
  const playerEntity = tables.Account.use()?.value;
  const fleets = useOrbitingFleets(selectedRock, playerEntity);

  const willFriendlyFire = useMemo(() => {
    return !!fleets.find((fleet) => tables.FleetStance.get(fleet)?.stance == EFleetStance.Defend);
  }, [fleets]);

  if (!playerEntity) return null;

  return (
    <Navigator.Screen title="attack" className="space-y-2">
      {fleets.length !== 0 && (
        <>
          <div className="text-xs opacity-50 flex gap-2 items-center">
            <FaInfoCircle /> HOVER TO SEE DETAILS
          </div>
          <div className="flex flex-col gap-1 h-48  min-w-96 w-fit overflow-y-auto hide-scrollbar">
            {fleets.map((fleet) => (
              <Fleet key={fleet} fleetEntity={fleet} target={target} willFriendlyFire={willFriendlyFire} />
            ))}
          </div>
        </>
      )}

      {fleets.length === 0 && (
        <SecondaryCard className="flex-col items-center justify-center h-48 px-10">
          <p className="text-xs">No fleets available to attack</p>
        </SecondaryCard>
      )}
      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
