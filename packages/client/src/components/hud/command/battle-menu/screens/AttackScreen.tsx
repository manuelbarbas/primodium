import { Navigator } from "@/components/core/Navigator";
import { components } from "@/network/components";
import { Entity } from "@latticexyz/recs";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToFleetName, entityToRockName } from "@/util/name";
import React, { useMemo } from "react";
import { EFleetStance } from "contracts/config/enums";
import { Button } from "@/components/core/Button";
import { formatTime } from "@/util/number";
import { FaInfoCircle } from "react-icons/fa";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { hashEntities } from "@/util/encode";
import { TransactionQueueType } from "@/util/constants";
import { useMud } from "@/hooks";
import { useOrbitingFleets } from "@/hooks/useOrbitingFleets";
import { attack } from "@/network/setup/contractCalls/attack";
import { clearFleetStance } from "@/network/setup/contractCalls/fleetStance";

export const Fleet: React.FC<{ fleetEntity: Entity; target: Entity }> = ({ fleetEntity, target }) => {
  const mud = useMud();
  const movement = components.FleetMovement.use(fleetEntity);
  const stance = components.FleetStance.use(fleetEntity);
  const fleetCooldown = components.CooldownEnd.use(fleetEntity)?.value ?? 0n;
  const now = components.Time.use()?.value ?? 0n;
  const inCooldown = fleetCooldown > now;
  const isFleetEmpty = !!components.IsFleetEmpty.use(fleetEntity)?.value;

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
        components.HoverEntity.set({
          value: fleetEntity,
        })
      }
      onPointerLeave={() => components.HoverEntity.remove()}
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
            <Button size="sm" variant="error" onClick={() => clearFleetStance(mud, fleetEntity)}>
              Clear Stance
            </Button>
          </TransactionQueueMask>
        )}
        {!inCooldown && !isFleetEmpty && !stance?.stance && (
          <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Attack, fleetEntity, target)}>
            <Button size="sm" variant="error" onClick={() => attack(mud, fleetEntity, target)}>
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
  const playerEntity = components.Account.use()?.value;
  const fleets = useOrbitingFleets(selectedRock, playerEntity);

  if (!playerEntity) return null;

  return (
    <Navigator.Screen title="attack" className="space-y-2">
      {fleets.length !== 0 && (
        <>
          <div className="text-xs opacity-50 flex gap-2 items-center">
            <FaInfoCircle /> HOVER TO SEE DETAILS
          </div>
          <div className="flex flex-col gap-1 h-48 w-96 overflow-y-auto hide-scrollbar">
            {fleets.map((fleet) => (
              <Fleet key={fleet} fleetEntity={fleet} target={target} />
            ))}
          </div>
        </>
      )}

      {fleets.length === 0 && (
        <SecondaryCard className="flex-col items-center justify-center h-48">
          <p className="text-xs">No fleets available to travel</p>
        </SecondaryCard>
      )}
      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
