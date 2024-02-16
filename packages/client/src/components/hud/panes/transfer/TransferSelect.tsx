import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { Hex } from "viem";
import { OwnedAsteroid } from "../OwnedAsteroids";
import { OwnedFleet } from "../OwnedFleets";

export const TransferSelect = ({
  rockEntity,
  activeEntity,
  setEntity,
  showNewFleet,
}: {
  rockEntity: Entity;
  activeEntity?: Entity | "newFleet";
  setEntity: (entity: Entity | "newFleet") => void;
  showNewFleet?: boolean;
}) => {
  showNewFleet;
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: rockEntity })];
  const time = components.Time.use()?.value ?? 0n;
  const fleetsOnRock = [...useEntityQuery(query)].filter(
    (entity) => entity !== activeEntity && (components.FleetMovement.get(entity)?.arrivalTime ?? 0n < time)
  );
  console.log("fleets on rock:", fleetsOnRock);

  const fleetsAvailable =
    components.ResourceCount.getWithKeys({ entity: rockEntity as Hex, resource: EResource.U_MaxMoves })?.value ?? 0n;

  return (
    <div className="w-full h-full bg-base-100 p-2 overflow-hidden pb-8 flex flex-col gap-2 border border-secondary/50">
      <div className="w-full h-12 grid place-items-center text-sm uppercase font-bold">Select A Fleet or Asteroid</div>
      <div className="overflow-y-auto grid grid-cols-2 gap-4 p-1 w-full scrollbar">
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
  );
};
