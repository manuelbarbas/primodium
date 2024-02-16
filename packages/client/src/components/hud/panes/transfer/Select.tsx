import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";
import { FleetEntityHeader } from "../fleets/FleetHeader";

export const Select = ({
  rockEntity,
  activeEntity,
  setEntity,
  showNewFleet,
}: {
  rockEntity: Entity;
  activeEntity?: Entity | "newFleet";
  setEntity: (entity: Entity) => void;
  showNewFleet?: boolean;
}) => {
  showNewFleet;
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: rockEntity })];
  const time = components.Time.use()?.value ?? 0n;
  const fleetsOnRock = [rockEntity, ...useEntityQuery(query)].filter(
    (entity) => entity !== activeEntity && (components.FleetMovement.get(entity)?.arrivalTime ?? 0n < time)
  );

  return (
    <div className="w-full h-full bg-base-100 p-2 overflow-hidden pb-8 flex flex-col gap-2 border border-secondary/50">
      <div className="w-full h-12 bg-neutral grid place-items-center text-sm uppercase font-bold">
        Select A Fleet or Asteroid
      </div>

      <div className="overflow-y-auto flex gap-1 flex-col w-full h-full scrollbar">
        {fleetsOnRock.map((entity) => {
          const Header = components.IsFleet.get(entity)?.value ? FleetEntityHeader : TargetHeader;
          return (
            <Button className="btn-primary p-2 btn-xs" onClick={() => setEntity(entity)} key={`select-${entity}`}>
              <Header entity={entity} />
            </Button>
          );
        })}
      </div>
    </div>
  );
};
