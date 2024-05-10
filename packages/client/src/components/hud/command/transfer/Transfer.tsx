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
import { usePrimodium } from "@/hooks/usePrimodium";
import { toast } from "react-toastify";

const Transfer: React.FC = () => {
  const { left, right, hovering, setHovering, deltas, setDeltas, moving, setMoving } = useTransfer();

  const selectedRock = components.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("No selected rock");

  const toEntity = right === "newFleet" || right === undefined ? singletonEntity : right;

  // Resources
  const transportables = components.P_Transportables.use()?.value ?? [];

  const toInitialResourceCounts = useFullResourceCounts(toEntity);
  const toResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = toInitialResourceCounts.get(entity)?.resourceCount;
    const delta = deltas.get(entity) ?? 0n;
    const movingCount = moving?.side == "right" && moving?.entity === entity ? moving.count : 0n;
    const total = (resourceCount ?? 0n) + delta - movingCount;
    if (total == 0n) return acc;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());

  const leftInitialResourceCounts = useFullResourceCounts(left ?? singletonEntity);
  const leftResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = leftInitialResourceCounts.get(entity)?.resourceCount ?? 0n;
    if (resourceCount == 0n) return acc;
    const delta = deltas.get(entity) ?? 0n;
    const movingCount = moving?.side == "left" && moving?.entity === entity ? moving.count : 0n;
    const total = resourceCount - delta - movingCount;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());
  // Units

  const leftInitialUnitCounts = useUnitCounts(left);
  const toInitialUnitCounts = useUnitCounts(toEntity);

  const leftUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = leftInitialUnitCounts.get(unit) ?? 0n;
      const delta = deltas.get(unit) ?? 0n;
      const movingCount = moving?.side == "left" ? (moving?.entity === unit ? moving.count : 0n) : 0n;
      const total = count - delta - movingCount;
      if (total === 0n) return acc;
      acc.set(unit, total);
      return acc;
    }, new Map<Entity, bigint>());
  }, [moving, leftInitialUnitCounts, deltas]);

  const toUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = toInitialUnitCounts.get(unit) ?? 0n;
      const delta = deltas.get(unit) ?? 0n;
      const movingCount = moving?.side == "right" ? (moving?.entity === unit ? moving.count : 0n) : 0n;
      if (count + delta > 0n) acc.set(unit, count + delta - movingCount);
      return acc;
    }, new Map<Entity, bigint>());
  }, [moving, deltas, toInitialUnitCounts]);

  const stopMoving = useCallback(
    (rightClick?: boolean) => {
      document.body.style.userSelect = "";
      if (!moving) return;
      if (!hovering || hovering === moving.side) {
        setMoving(null);
        setHovering(null);
        return;
      }
      const rawCount = rightClick ? parseResourceCount(moving.entity, "1") : moving.count;
      const recipient = hovering === "left" ? left : right;
      const count = moving.side == "left" ? rawCount : -rawCount;
      let amountMoved = 0n;

      if (UnitStorages.has(moving.entity)) {
        const newMap = new Map(deltas);
        amountMoved = count;
        newMap.set(moving.entity, (deltas.get(moving.entity) ?? 0n) + count);
        setDeltas(newMap);
      } else {
        const recipientIsFleet = recipient === "newFleet" || !!components.IsFleet.get(recipient)?.value;

        const fleetOwner = (
          recipientIsFleet && recipient !== "newFleet" ? components.OwnedBy.get(recipient)?.value : undefined
        ) as Entity | undefined;

        let resourceStorage: bigint = 0n;
        let resourceCount: bigint = 0n;

        if (recipientIsFleet) {
          const unitCounts = moving.side === "left" ? toUnitCounts : leftUnitCounts;
          resourceStorage = getFleetStatsFromUnits(unitCounts, fleetOwner).cargo;
          const resourceCounts = moving.side === "left" ? toResourceCounts : leftResourceCounts;
          resourceCount = [...resourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n);
        } else {
          resourceStorage = getFullResourceCount(moving.entity, recipient as Entity).resourceStorage;
          const resourceCounts = moving.side === "left" ? toResourceCounts : leftResourceCounts;
          resourceCount = resourceCounts.get(moving.entity) ?? 0n;
        }

        const outcome = count + resourceCount;
        amountMoved = resourceStorage < outcome ? resourceStorage - resourceCount : count;
        if (amountMoved === 0n)
          toast.error("Not enough cargo to add resources. Transfer units to increase cargo space.");

        const newMap = new Map(deltas);
        newMap.set(moving.entity, (deltas.get(moving.entity) ?? 0n) + amountMoved);
        setDeltas(newMap);
      }
      if (!rightClick || amountMoved === moving.count || amountMoved === 0n) {
        setMoving(null);
        setHovering(null);
      } else {
        setMoving({
          ...moving,
          count: moving.count - parseResourceCount(moving.entity, "1"),
        });
      }
    },
    [hovering, moving, right, toUnitCounts, toResourceCounts, deltas]
  );

  const api = usePrimodium().api("COMMAND_CENTER");
  useEffect(() => {
    if (!api) return;

    const upListener = api.input.addListener("Up", () => handleKeyDown(10), true);
    const downListener = api.input.addListener("Down", () => handleKeyDown(-10), true);
    const leftListener = api.input.addListener("Left", () => handleKeyDown(-100), true);
    const rightListener = api.input.addListener("Right", () => handleKeyDown(100), true);

    return () => {
      upListener.dispose();
      downListener.dispose();
      leftListener.dispose();
      rightListener.dispose();
    };
  }, [api]);

  const handleKeyDown = useCallback(
    (change: number) => {
      if (!moving) return;
      const initial = UnitStorages.has(moving.entity)
        ? leftUnitCounts.get(moving.entity) ?? 0n
        : leftResourceCounts.get(moving.entity) ?? 0n;

      const negative = change < 0;
      const delta = parseResourceCount(moving.entity, `${Math.abs(change)}`);
      setMoving({
        ...moving,
        count: !negative
          ? bigIntMin(initial + moving.count, moving.count + delta)
          : bigIntMax(1n, moving.count - delta),
      });
    },
    [moving, leftResourceCounts, leftUnitCounts]
  );

  useEffect(() => {
    const clickCallback = (e: MouseEvent) => {
      stopMoving(e.button === 2);
    };
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    window.addEventListener("mouseup", clickCallback);
    return () => {
      window.removeEventListener("contextmenu", (event) => {
        event.preventDefault();
      });

      window.removeEventListener("mouseup", clickCallback);
    };
  }, [handleKeyDown, stopMoving]);

  return (
    <div className="w-[70rem] h-[44rem] flex flex-col gap-4">
      <p>Transfer Units and Resources</p>
      <Moving {...moving} />
      <div className="relative grid grid-cols-[1fr_250px_1fr] gap-2 h-full w-full">
        <TransferPane
          type="left"
          unitCounts={leftUnitCounts}
          resourceCounts={leftResourceCounts}
          selectPlacement="top-right"
        />
        <div className="flex w-full justify-center items-end w-full">
          <div className="grid grid-rows-2 gap-4">
            <TransactionQueueMask queueItemId={"TRANSFER" as Entity} className="w-full">
              <TransferConfirm
                leftUnits={leftUnitCounts}
                leftResources={leftResourceCounts}
                rightUnits={toUnitCounts}
                rightResources={toResourceCounts}
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
        <TransferPane type="right" unitCounts={toUnitCounts} resourceCounts={toResourceCounts} />
      </div>
    </div>
  );
};

const Moving = ({ entity, count }: { entity?: Entity; count?: bigint }) => {
  const [dragLocation, setDragLocation] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setDragLocation({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, [entity]);

  if (!entity || !count) return null;
  return ReactDOM.createPortal(
    <div
      className={`font-mono fixed pointer-events-none transform -translate-x-1/2 -translate-y-1/4`}
      style={{ left: dragLocation.x, top: dragLocation.y, zIndex: 1002 }}
    >
      <ResourceIcon resource={entity} count={count} />
    </div>,
    document.body
  );
};

export default Transfer;
