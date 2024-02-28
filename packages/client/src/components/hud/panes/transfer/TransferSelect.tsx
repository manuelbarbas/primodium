import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Hex } from "viem";
import { OwnedAsteroid } from "../OwnedAsteroids";
import { OwnedFleet } from "../OwnedFleets";

export const TransferSelect = ({
  activeEntity,
  setEntity,
  showNewFleet,
  hideNotOwned,
}: {
  activeEntity?: Entity | "newFleet";
  setEntity: (entity: Entity | "newFleet") => void;
  showNewFleet?: boolean;
  hideNotOwned?: boolean;
}) => {
  const rockEntity = components.ActiveRock.use()?.value;
  if (!rockEntity) throw new Error("No active rock");
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: rockEntity })];
  const time = components.Time.use()?.value ?? 0n;
  const playerEntity = useMud().playerAccount.entity;
  const fleetsOnRock = [...useEntityQuery(query)].filter((entity) => {
    if (entity == activeEntity) return false;
    const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;
    if (!hideNotOwned) return true;

    const fleetOwnerRock = components.OwnedBy.get(entity)?.value as Entity | undefined;
    const fleetOwnerPlayer = components.OwnedBy.get(fleetOwnerRock)?.value;
    return fleetOwnerPlayer == playerEntity;
  });

  const fleetsAvailable =
    components.ResourceCount.getWithKeys({ entity: rockEntity as Hex, resource: EResource.U_MaxFleets })?.value ?? 0n;

  return (
    <div className="w-full h-full bg-base-100 p-2 overflow-hidden flex flex-col gap-2 border border-secondary/50">
      <div className="w-full h-12 grid place-items-center text-sm uppercase font-bold">Select A Fleet or Asteroid</div>
      <div className="relative w-full h-full overflow-y-auto overflow-x-hidden scrollbar">
        <div className="grid grid-cols-2 gap-2 w-full">
          {activeEntity !== rockEntity && <OwnedAsteroid asteroid={rockEntity} onClick={() => setEntity(rockEntity)} />}
          {showNewFleet &&
            Array(Number(fleetsAvailable))
              .fill(0)
              .map((_, index) => (
                <Button
                  disabled={activeEntity !== rockEntity}
                  key={`newFleet-${index}`}
                  className="row-span-1 flex flex-col p-2 min-h-36 items-center text-xs bg-base-100 h-full flex-nowrap border-secondary"
                  onClick={() => setEntity("newFleet")}
                >
                  <img src="/img/icons/addicon.png" className="w-8" />
                  New Fleet
                </Button>
              ))}
          {fleetsOnRock.map((fleet) => (
            <OwnedFleet key={`select-fleet-${fleet}`} fleet={fleet} onClick={() => setEntity(fleet)} />
          ))}
        </div>
      </div>
    </div>
  );
};
