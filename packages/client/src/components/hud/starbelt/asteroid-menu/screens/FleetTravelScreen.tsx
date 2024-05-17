import { Navigator } from "@/components/core/Navigator";
import { components } from "@/network/components";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToFleetName, entityToRockName } from "@/util/name";
import React, { useMemo } from "react";
import { EFleetStance } from "contracts/config/enums";
import { Button } from "@/components/core/Button";
import { getMoveLength } from "@/util/send";
import { getFleetUnitCounts } from "@/util/unit";
import { formatTime } from "@/util/number";
import { FaInfoCircle } from "react-icons/fa";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { hashEntities } from "@/util/encode";
import { TransactionQueueType } from "@/util/constants";
import { sendFleetPosition } from "@/network/setup/contractCalls/fleetSend";
import { useMud } from "@/hooks";
import { clearFleetStance } from "@/network/setup/contractCalls/fleetStance";

export const Fleet: React.FC<{ fleetEntity: Entity; playerEntity: Entity; selectedRock: Entity }> = ({
  fleetEntity,
  playerEntity,
  selectedRock,
}) => {
  const mud = useMud();
  const movement = components.FleetMovement.use(fleetEntity);
  const stance = components.FleetStance.use(fleetEntity);
  const destPos = components.Position.use(selectedRock);
  const fleetCooldown = components.CooldownEnd.use(fleetEntity)?.value ?? 0n;
  const now = components.Time.use()?.value ?? 0n;
  const inCooldown = fleetCooldown > now;

  const fleetStateText = useMemo(() => {
    if (stance && stance?.stance === EFleetStance.Follow)
      return `Following ${entityToFleetName(stance.target as Entity)}`;
    if (stance?.stance === EFleetStance.Block) return "Blocking";
    if (stance?.stance === EFleetStance.Defend) return "Defending";
    return "Orbiting";
  }, [stance]);

  const fleetETA = useMemo(() => {
    const startPos = components.Position.get(movement?.destination as Entity);
    const destPos = components.Position.get(selectedRock);

    return getMoveLength(
      startPos ?? { x: 0, y: 0 },
      destPos ?? { x: 0, y: 0 },
      playerEntity,
      Object.fromEntries(getFleetUnitCounts(fleetEntity))
    );
  }, [movement, playerEntity, selectedRock, fleetEntity]);

  if (!destPos) return null;

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
        {inCooldown && (
          <Button size="sm" variant="error" disabled>
            IN COOLDOWN
          </Button>
        )}
        {!stance?.stance && !inCooldown && (
          <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.SendFleet, fleetEntity)}>
            <Button size="sm" variant="secondary" onClick={() => sendFleetPosition(mud, fleetEntity, destPos)}>
              Travel
            </Button>
          </TransactionQueueMask>
        )}
        {stance?.stance && !inCooldown && (
          <TransactionQueueMask queueItemId={"FleetStance" as Entity}>
            <Button size="sm" variant="info" onClick={() => clearFleetStance(mud, fleetEntity)}>
              Clear Stance
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
  const query = [Has(components.IsFleet)];
  const playerEntity = components.Account.use()?.value;
  const fleets = useEntityQuery(query);
  const time = components.Time.use()?.value ?? 0n;

  const ownedFleetsSorted = useMemo(
    () =>
      fleets
        .filter((entity) => {
          const ownedBy = components.OwnedBy.get(entity)?.value as Entity | undefined;
          const rock = components.FleetMovement.get(entity)?.destination as Entity | undefined;
          const selectedRock = components.SelectedRock.get()?.value;
          if (!rock || !ownedBy) return false;
          if (selectedRock === rock) return false;
          const player = components.OwnedBy.get(ownedBy)?.value;
          return player === playerEntity;
        })
        .sort((a, b) => {
          const aMovement = components.FleetMovement.get(a);
          const bMovement = components.FleetMovement.get(b);
          const aDest = aMovement?.destination;
          const bDest = bMovement?.destination;

          if (!aDest || !bDest) return 0;

          const aPos = components.Position.get(aDest as Entity);
          const bPos = components.Position.get(bDest as Entity);
          const destPos = components.Position.get(selectedRock);

          if (!playerEntity || !destPos || !aPos || !bPos) return 0;

          const aLen = getMoveLength(aPos, destPos, playerEntity, Object.fromEntries(getFleetUnitCounts(a)));
          const bLen = getMoveLength(bPos, destPos, playerEntity, Object.fromEntries(getFleetUnitCounts(b)));

          return aLen - bLen;
        }),
    [fleets, playerEntity, selectedRock]
  );

  const orbitingFleets = useMemo(() => {
    return ownedFleetsSorted.filter((fleet) => {
      const movement = components.FleetMovement.get(fleet);
      const isEmpty = !!components.IsFleetEmpty.get(fleet)?.value;
      const rock = components.FleetMovement.get(fleet)?.destination as Entity | undefined;
      const selectedRock = components.SelectedRock.get()?.value;
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
