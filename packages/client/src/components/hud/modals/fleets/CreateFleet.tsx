import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import { useEffect, useState } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { ResourceEntityLookup, ResourceImage } from "src/util/constants";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";

const ResourceIcon = ({
  resource,
  amount,
  setDragging = () => null,
}: {
  resource: Entity;
  amount: bigint;
  setDragging?: (entity: Entity) => void;
}) => (
  <div
    onMouseDown={() => setDragging(resource)}
    className="flex flex-col gap-1 items-center justify-center bg-neutral border border-primary w-full h-full p-2"
  >
    <img src={ResourceImage.get(resource) ?? ""} className={`pixel-images w-16 scale-200 font-bold text-lg`} />
    <p className="font-bold">{formatResourceCount(resource, amount, { fractionDigits: 0 })}</p>
  </div>
);

const UnitIcon = ({ unit, amount }: { unit: Entity; amount: bigint }) => (
  <div className="flex flex-col gap-1 items-center justify-center bg-neutral border border-primary w-full h-full p-2">
    <img src={ResourceImage.get(unit) ?? ""} className={`pixel-images w-16 scale-200 font-bold text-lg`} />
    <p className="font-bold">{amount.toString()}</p>
  </div>
);

export const CreateFleet = () => {
  const [fleetUnitCounts] = useState<Record<Entity, bigint>>({});
  const [fleetResourceCounts] = useState<Record<Entity, bigint>>({});
  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
    window.addEventListener("mouseup", () => {
      document.body.style.userSelect = "";

      setDragging(null);
      window.removeEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
    });
    return () => {
      window.removeEventListener("mouseup", () => setDragging(null));
    };
  });

  const initDragging = (val: { entity: Entity; count: bigint }) => {
    document.body.style.userSelect = "none";

    setDragging(val);
    setDragLocation({ x: -1000, y: -1000 });
    window.addEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  };

  console.log(dragging, dragLocation);

  return (
    <Navigator.Screen title="CreateFleet" className="w-full h-full flex flex-col gap-2 p-2">
      {dragging && (
        <div className={`fixed`} style={{ left: dragLocation.x, top: dragLocation.y }}>
          <ResourceIcon resource={dragging.entity} amount={dragging.count} />
        </div>
      )}

      <p className="w-full uppercase opacity-50 font-bold text-xs text-left">Create Fleet</p>
      <div className="grid grid-cols-2 w-full h-full gap-4">
        <div className="w-full h-full bg-base-100 p-2 flex flex-col gap-2">
          <div className="h-12">
            <TargetHeader />
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {units?.units.map((unit) => (
              <UnitIcon key={`from-unit-${unit}`} unit={unit} amount={units.counts[units.units.indexOf(unit)]} />
            ))}
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(transportableResources).map(([entity, data]) => (
              <ResourceIcon
                key={`from-resource-${entity}`}
                resource={entity as Entity}
                amount={data}
                setDragging={(entity: Entity) => initDragging({ entity, count: parseResourceCount(entity, "1") })}
              />
            ))}
          </div>
        </div>
        <div className="w-full h-full bg-base-100 p-2 flex flex-col gap-2">
          <div className="h-12">Your Fleet</div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(fleetUnitCounts).map(([unit, count]) => (
              <UnitIcon key={`to-unit-${unit}`} unit={unit as Entity} amount={count} />
            ))}
          </div>
          <div className="flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
            {Object.entries(fleetResourceCounts).map(([entity, data]) => (
              <ResourceIcon key={`to-resource-${entity}`} resource={entity as Entity} amount={data} />
            ))}
          </div>
        </div>
      </div>
      <Button
        className="w-fit btn-primary w-36"
        disabled={Object.entries(fleetResourceCounts).length + Object.entries(fleetUnitCounts).length === 0}
      >
        Create
      </Button>
    </Navigator.Screen>
  );
};
