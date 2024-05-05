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

export const Fleet: React.FC<{ fleetEntity: Entity; playerEntity: Entity; selectedRock: Entity }> = ({
  fleetEntity,
  playerEntity,
  selectedRock,
}) => {
  const movement = components.FleetMovement.use(fleetEntity);
  const stance = components.FleetStance.use(fleetEntity);

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

  return (
    <SecondaryCard className="flex-row justify-between gap-10 items-center">
      <div
        className="flex gap-2"
        onPointerOver={() =>
          components.HoverEntity.set({
            value: fleetEntity,
          })
        }
        onPointerLeave={() => components.HoverEntity.remove()}
      >
        <IconLabel imageUri={InterfaceIcons.Outgoing} />
        <div>
          <p className="text-sm">{entityToFleetName(fleetEntity)}</p>
          <p className="opacity-75 text-xs">{`${fleetStateText} ${entityToRockName(
            movement?.destination as Entity
          )}`}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="sm" variant="secondary" disabled={!!stance?.stance}>
          Travel
        </Button>
        <p className="text-xs opacity-75">ETA {formatTime(fleetETA)}</p>
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
          const rock = components.OwnedBy.get(entity)?.value as Entity;
          const selectedRock = components.SelectedRock.get()?.value;
          if (!rock) return false;
          if (selectedRock === rock) return false;
          const player = components.OwnedBy.get(rock)?.value;
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
            <FaInfoCircle /> HOVER OVER FLEET TO SEE DETAILS
          </div>
          <div className="flex flex-col gap-1 h-48 overflow-y-auto hide-scrollbar">
            {orbitingFleets.map((fleet) => (
              <Fleet key={fleet} fleetEntity={fleet} playerEntity={playerEntity} selectedRock={selectedRock} />
            ))}
          </div>
        </>
      )}

      {orbitingFleets.length === 0 && (
        <SecondaryCard>
          <p className="text-center px-10 py-16">No fleets available to travel</p>
        </SecondaryCard>
      )}
      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
