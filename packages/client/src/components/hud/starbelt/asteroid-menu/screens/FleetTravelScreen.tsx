import { EFleetStance } from "contracts/config/enums";
import React, { useMemo } from "react";
import { FaInfoCircle } from "react-icons/fa";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToFleetName, entityToRockName, formatTime } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Navigator } from "@/components/core/Navigator";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";

export const Fleet: React.FC<{ fleetEntity: Entity; playerEntity: Entity; selectedRock: Entity }> = ({
  fleetEntity,
  playerEntity,
  selectedRock,
}) => {
  const { tables, utils } = useCore();
  const { clearFleetStance, sendFleetPosition } = useContractCalls();
  const movement = tables.FleetMovement.use(fleetEntity);
  const stance = tables.FleetStance.use(fleetEntity);
  const destPos = tables.Position.use(selectedRock);
  const fleetCooldown = tables.CooldownEnd.use(fleetEntity)?.value ?? 0n;
  const now = tables.Time.use()?.value ?? 0n;
  const inCooldown = fleetCooldown > now;

  const fleetStateText = useMemo(() => {
    if (stance && stance?.stance === EFleetStance.Follow)
      return `Following ${entityToFleetName(stance.target as Entity)}`;
    if (stance?.stance === EFleetStance.Block) return "Blocking";
    if (stance?.stance === EFleetStance.Defend) return "Defending";
    return "Orbiting";
  }, [stance]);

  const asteroidBlocked = useMemo(() => {
    return utils.isAsteroidBlocked(movement?.destination as Entity);
  }, [now, movement]);

  const fleetETA = useMemo(() => {
    const startPos = tables.Position.get(movement?.destination as Entity);
    const destPos = tables.Position.get(selectedRock);

    return utils.getMoveLength(
      startPos ?? { x: 0, y: 0 },
      destPos ?? { x: 0, y: 0 },
      playerEntity,
      Object.fromEntries(utils.getFleetUnitCounts(fleetEntity)),
    );
  }, [movement, playerEntity, selectedRock, fleetEntity]);

  if (!destPos) return null;

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
            movement?.destination as Entity,
          )}`}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        {inCooldown && (
          <Button size="sm" variant="error" disabled>
            IN COOLDOWN
          </Button>
        )}
        {stance?.stance && !inCooldown && (
          <TransactionQueueMask queueItemId={"FleetStance" as Entity}>
            <Button size="sm" variant="info" onClick={() => clearFleetStance(fleetEntity)}>
              Clear Stance
            </Button>
          </TransactionQueueMask>
        )}
        {asteroidBlocked && !inCooldown && !stance?.stance && (
          <Button size="sm" variant="error" disabled>
            BLOCKED
          </Button>
        )}
        {!stance?.stance && !inCooldown && !asteroidBlocked && (
          <TransactionQueueMask queueItemId={`send-${fleetEntity}`}>
            <Button size="sm" variant="secondary" onClick={() => sendFleetPosition(fleetEntity, destPos)}>
              Travel
            </Button>
          </TransactionQueueMask>
        )}
        {!inCooldown && <p className="text-xs opacity-75">ETA {formatTime(fleetETA)}</p>}
        {inCooldown && <p className="text-xs opacity-75">COOLDOWN {formatTime(fleetCooldown - now)}</p>}
      </div>
    </SecondaryCard>
  );
};

export const FleetTravelScreen: React.FC<{ selectedRock: Entity }> = ({ selectedRock }) => {
  const { tables, utils } = useCore();
  const fleets = useQuery({ with: [tables.IsFleet] });
  const playerEntity = tables.Account.use()?.value;
  const time = tables.Time.use()?.value ?? 0n;

  const ownedFleetsSorted = useMemo(
    () =>
      fleets
        .filter((entity) => {
          const ownedBy = tables.OwnedBy.get(entity)?.value as Entity | undefined;
          const rock = tables.FleetMovement.get(entity)?.destination as Entity | undefined;
          const selectedRock = tables.SelectedRock.get()?.value;
          if (!rock || !ownedBy) return false;
          if (selectedRock === rock) return false;
          const player = tables.OwnedBy.get(ownedBy)?.value;
          return player === playerEntity;
        })
        .sort((a, b) => {
          const aMovement = tables.FleetMovement.get(a);
          const bMovement = tables.FleetMovement.get(b);
          const aDest = aMovement?.destination;
          const bDest = bMovement?.destination;

          if (!aDest || !bDest) return 0;

          const aPos = tables.Position.get(aDest as Entity);
          const bPos = tables.Position.get(bDest as Entity);
          const destPos = tables.Position.get(selectedRock);

          if (!playerEntity || !destPos || !aPos || !bPos) return 0;

          const aLen = utils.getMoveLength(
            aPos,
            destPos,
            playerEntity,
            Object.fromEntries(utils.getFleetUnitCounts(a)),
          );
          const bLen = utils.getMoveLength(
            bPos,
            destPos,
            playerEntity,
            Object.fromEntries(utils.getFleetUnitCounts(b)),
          );

          return aLen - bLen;
        }),
    [fleets, playerEntity, selectedRock],
  );

  const orbitingFleets = useMemo(() => {
    return ownedFleetsSorted.filter((fleet) => {
      const movement = tables.FleetMovement.get(fleet);
      const isEmpty = !!tables.IsFleetEmpty.get(fleet)?.value;
      const rock = tables.FleetMovement.get(fleet)?.destination as Entity | undefined;
      const selectedRock = tables.SelectedRock.get()?.value;
      if (!rock) return false;
      if (selectedRock === rock) return false;

      if (isEmpty) return false;

      const arrivalTime = movement?.arrivalTime ?? 0n;
      return arrivalTime <= (time ?? 0n);
    });
  }, [ownedFleetsSorted, time]);

  if (!playerEntity) return null;

  return (
    <Navigator.Screen title="travel" className="space-y-2">
      {orbitingFleets.length !== 0 && (
        <>
          <div className="text-xs opacity-50 flex gap-2 items-center">
            <FaInfoCircle /> HOVER TO SEE DETAILS
          </div>
          <div className="flex flex-col gap-1 h-48 overflow-y-auto hide-scrollbar">
            {orbitingFleets.map((fleet) => (
              <Fleet key={fleet} fleetEntity={fleet} playerEntity={playerEntity} selectedRock={selectedRock} />
            ))}
          </div>
        </>
      )}

      {orbitingFleets.length === 0 && (
        <SecondaryCard className="flex-col items-center justify-center h-48 w-96">
          <p className="text-xs">No fleets available to travel</p>
        </SecondaryCard>
      )}
      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
