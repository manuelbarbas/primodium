import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { ResourceEntityLookup, UnitStorages } from "src/util/constants";
import { parseResourceCount } from "src/util/number";
import { getFullResourceCount } from "src/util/resource";
import { getFleetStatsFromUnits } from "src/util/unit";
import { ResourceIcon } from "./ResourceIcon";
import { TransferConfirm } from "./TransferConfirm";
import { TransferPane } from "./TransferPane";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { Button } from "@/components/core/Button";

const Transfer: React.FC = () => {
  const { from, to, hovering, setHovering, deltas, setDeltas, moving, setMoving } = useTransfer();

  const selectedRock = components.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("No selected rock");

  const toEntity = to === "newFleet" || to === undefined ? singletonEntity : to;

  // Resources
  const transportables = components.P_Transportables.use()?.value ?? [];

  const toInitialResourceCounts = useFullResourceCounts(toEntity);
  const toResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = toInitialResourceCounts.get(entity)?.resourceCount;
    const delta = deltas.get(entity) ?? 0n;
    const total = (resourceCount ?? 0n) + delta;
    if (total == 0n) return acc;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());

  const fromInitialResourceCounts = useFullResourceCounts(from ?? singletonEntity);
  const fromResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = fromInitialResourceCounts.get(entity)?.resourceCount ?? 0n;
    if (resourceCount == 0n) return acc;
    const delta = deltas.get(entity) ?? 0n;
    const movingCount = moving?.entity === entity ? moving.count : 0n;
    const total = resourceCount - delta - movingCount;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());
  // Units

  const fromInitialUnitCounts = useUnitCounts(from);
  const toInitialUnitCounts = useUnitCounts(toEntity);

  const fromUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = fromInitialUnitCounts.get(unit) ?? 0n;
      if (count == 0n) return acc;
      const delta = deltas.get(unit) ?? 0n;
      const movingCount = moving?.entity === unit ? moving.count : 0n;
      const total = count - delta - movingCount;
      acc.set(unit, total);
      return acc;
    }, new Map<Entity, bigint>());
  }, [moving, fromInitialUnitCounts, deltas]);

  const toUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = toInitialUnitCounts.get(unit) ?? 0n;
      const delta = deltas.get(unit) ?? 0n;
      if (count + delta > 0n) acc.set(unit, count + delta);
      return acc;
    }, new Map<Entity, bigint>());
  }, [deltas, toInitialUnitCounts]);

  const stopMoving = useCallback(() => {
    if (!moving) return;
    document.body.style.userSelect = "";
    setMoving(null);
    if (hovering === "to" && moving) {
      if (UnitStorages.has(moving.entity)) {
        const newMap = new Map(deltas);
        newMap.set(moving.entity, (deltas.get(moving.entity) ?? 0n) + moving.count);
        setDeltas(newMap);
        return;
      }
      const toIsFleet = to === "newFleet" || !!components.IsFleet.get(to)?.value;

      const resourceCount = toIsFleet
        ? [...toResourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n)
        : toResourceCounts.get(moving.entity) ?? 0n;

      const fleetOwner = (toIsFleet && to !== "newFleet" ? components.OwnedBy.get(to)?.value : undefined) as
        | Entity
        | undefined;
      const resourceStorage = toIsFleet
        ? getFleetStatsFromUnits(toUnitCounts, fleetOwner).cargo
        : getFullResourceCount(moving.entity, to as Entity).resourceStorage;

      const outcome = moving.count + resourceCount;
      const amountMoved = resourceStorage < outcome ? resourceStorage - resourceCount : moving.count;
      const newMap = new Map(deltas);
      newMap.set(moving.entity, bigIntMax(0n, (deltas.get(moving.entity) ?? 0n) + amountMoved));
      setDeltas(newMap);
    }
    setHovering(null);
  }, [hovering, moving, to, toUnitCounts, toResourceCounts, deltas]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!moving) return;
      const initial = UnitStorages.has(moving.entity)
        ? fromUnitCounts.get(moving.entity) ?? 0n
        : fromResourceCounts.get(moving.entity) ?? 0n;

      if (["e", "E", "Dead"].includes(e.key)) {
        const delta = parseResourceCount(moving.entity, "1");
        setMoving({
          ...moving,
          count: bigIntMin(initial + moving.count, moving.count + delta),
        });
      } else if (["q", "œ", "Q"].includes(e.key)) {
        const delta = parseResourceCount(moving.entity, "1");
        const min = delta;
        setMoving({ ...moving, count: bigIntMax(min, moving.count - delta) });
      } else if (["d", "D", "∂"].includes(e.key)) {
        const delta = parseResourceCount(moving.entity, "100");
        setMoving({ ...moving, count: bigIntMin(initial + moving.count, moving.count + delta) });
      } else if (["a", "A", "å"].includes(e.key)) {
        const delta = parseResourceCount(moving.entity, "100");
        const min = parseResourceCount(moving.entity, "1");
        setMoving({ ...moving, count: bigIntMax(min, moving.count - delta) });
      } else if (e.key === "Shift") {
        setMoving({ ...moving, count: initial });
      } else if (e.key === "Alt") {
        setMoving({ ...moving, count: initial / 2n });
      }
    },
    [moving, fromResourceCounts, fromUnitCounts]
  );

  useEffect(() => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mouseup", stopMoving);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", (event) => event.preventDefault());
      window.removeEventListener("mouseup", stopMoving);
    };
  }, [handleKeyDown, stopMoving]);

  return (
    <div className="w-[70rem] h-[44rem] flex flex-col gap-4">
      <p>Transfer Units and Resources</p>
      {moving && <Moving {...moving} />}
      <div className="relative grid grid-cols-[1fr_300px_1fr] gap-2 h-full w-full">
        <TransferPane type="from" unitCounts={fromUnitCounts} resourceCounts={fromResourceCounts} />
        <div className="flex w-full justify-center items-end w-full">
          <div className="grid grid-rows-2 gap-4">
            <TransactionQueueMask queueItemId={"TRANSFER" as Entity} className="w-full">
              <TransferConfirm
                fromUnits={fromUnitCounts}
                fromResources={fromResourceCounts}
                toUnits={toUnitCounts}
                toResources={toResourceCounts}
              />
            </TransactionQueueMask>

            <Button
              disabled={deltas.size === 0}
              variant="error"
              size="md"
              className="w-full"
              onClick={() => setDeltas(new Map())}
            >
              Clear
            </Button>
          </div>
        </div>
        <TransferPane type="to" unitCounts={toUnitCounts} resourceCounts={toResourceCounts} />
      </div>
    </div>
  );
};

const Moving = ({ entity, count }: { entity: Entity; count: bigint }) => {
  const [dragLocation, setDragLocation] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    window.addEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
    return window.removeEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  }, []);
  return ReactDOM.createPortal(
    <div
      className={`font-mono fixed pointer-events-none`}
      style={{ left: dragLocation.x, top: dragLocation.y, zIndex: 1002 }}
    >
      <ResourceIcon resource={entity} count={count} />
    </div>,
    document.body
  );
};

export default Transfer;
