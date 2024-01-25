import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import React, { useEffect, useState } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { ResourceEntityLookup, ResourceImage, UnitStorages } from "src/util/constants";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";

const ResourceIcon = ({
  resource,
  amount,
  setDragging = () => null,
}: {
  resource: Entity;
  amount: string;
  setDragging?: (e: React.MouseEvent, entity: Entity) => void;
}) => (
  <div
    onMouseDown={(e) => setDragging(e, resource)}
    className="flex flex-col gap-1 items-center justify-center bg-neutral border border-primary w-full h-full p-2"
  >
    <img
      src={ResourceImage.get(resource) ?? ""}
      className={`pixel-images w-16 scale-200 font-bold text-lg pointer-events-none`}
    />
    <p className="font-bold">{amount}</p>
  </div>
);

export const CreateFleet = () => {
  const [fleetCounts] = useState<Record<Entity, bigint>>({});
  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringArea, setHoveringArea] = useState<"from" | "to" | null>(null);
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const units = components.Hangar.use(selectedRock);
  const allResources = useFullResourceCounts(selectedRock);

  const transportables = components.P_Transportables.get()?.value ?? [];
  const transportableResources = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = allResources.get(entity)?.resourceCount;
    if (!resourceCount) return acc;
    acc[entity] = resourceCount;
    return acc;
  }, {} as Record<Entity, bigint>);

  useEffect(() => {
    const mouseUpListener = () => {
      document.body.style.userSelect = "";
      setDragging(null);
      if (hoveringArea === "to" && dragging) {
        fleetCounts[dragging.entity] = (fleetCounts[dragging.entity] ?? 0n) + dragging.count;
      }
      setHoveringArea(null);
      window.removeEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
    };

    window.addEventListener("mouseup", mouseUpListener);
    return () => {
      window.removeEventListener("mouseup", mouseUpListener);
    };
  });

  const initDragging = (e: React.MouseEvent, val: { entity: Entity; count: bigint }) => {
    document.body.style.userSelect = "none";

    setDragging(val);
    setDragLocation({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  };

  return (
    <Navigator.Screen title="CreateFleet" className="w-full h-full flex flex-col gap-2 p-2">
      {dragging && (
        <div className={`fixed pointer-events-none`} style={{ left: dragLocation.x, top: dragLocation.y }}>
          <ResourceIcon
            resource={dragging.entity}
            amount={formatResourceCount(dragging.entity, dragging.count, { fractionDigits: 0 })}
          />
        </div>
      )}

      <p className="w-full uppercase opacity-50 font-bold text-xs text-left">Create Fleet</p>
      <div
        className="grid grid-cols-2 w-full h-full gap-4"
        onMouseEnter={() => dragging && setHoveringArea("from")}
        onMouseLeave={() => setHoveringArea(null)}
      >
        <div className="w-full h-full bg-base-100 p-2 flex flex-col gap-2">
          <div className="h-12">
            <TargetHeader />
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {units?.units.map((unit) => (
              <ResourceIcon
                key={`from-unit-${unit}`}
                resource={unit}
                amount={units.counts[units.units.indexOf(unit)].toString()}
                setDragging={(e: React.MouseEvent, entity: Entity) => initDragging(e, { entity, count: 1n })}
              />
            ))}
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(transportableResources).map(([entity, data]) => (
              <ResourceIcon
                key={`from-resource-${entity}`}
                resource={entity as Entity}
                amount={formatResourceCount(
                  entity as Entity,
                  data -
                    (dragging?.entity === entity ? dragging?.count ?? 0n : 0n) -
                    (fleetCounts[entity as Entity] ?? 0n),
                  { fractionDigits: 0 }
                )}
                setDragging={(e: React.MouseEvent, entity: Entity) =>
                  initDragging(e, { entity, count: parseResourceCount(entity, "1") })
                }
              />
            ))}
          </div>
        </div>
        <div
          className={`w-full h-full bg-base-100 p-2 flex flex-col gap-2 ${
            hoveringArea === "to" ? "ring-2 ring-secondary" : ""
          }`}
          onMouseOver={() => dragging && setHoveringArea("to")}
          onMouseLeave={() => setHoveringArea(null)}
        >
          <div className="h-12">Your Fleet</div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(fleetCounts).map(([unit, count]) =>
              UnitStorages.has(unit as Entity) ? (
                <ResourceIcon key={`to-unit-${unit}`} resource={unit as Entity} amount={count.toString()} />
              ) : null
            )}
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(fleetCounts).map(([entity, data]) =>
              UnitStorages.has(entity as Entity) ? null : (
                <ResourceIcon
                  key={`to-resource-${entity}`}
                  resource={entity as Entity}
                  amount={formatResourceCount(entity as Entity, data, { fractionDigits: 0 })}
                />
              )
            )}
          </div>
        </div>
      </div>
      <Button className="w-fit btn-primary w-36" disabled={Object.entries(fleetCounts).length === 0}>
        Create
      </Button>
    </Navigator.Screen>
  );
};
