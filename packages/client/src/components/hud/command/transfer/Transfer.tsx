import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { FaInfoCircle } from "react-icons/fa";

import { parseResourceCount, ResourceEntityLookup, UnitStorages } from "@primodiumxyz/core";
import { useCore, useResourceCounts, useUnitCounts } from "@primodiumxyz/core/react";
import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { useGame } from "@/hooks/useGame";

import { ResourceIcon } from "./ResourceIcon";
import { TransferConfirm } from "./TransferConfirm";
import { TransferPane } from "./TransferPane";

const Transfer: React.FC = () => {
  const { left, right, hovering, setHovering, flash, deltas, setDeltas, moving, setMoving } = useTransfer();
  const { tables, utils } = useCore();

  const selectedRock = tables.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("No selected rock");

  const rightEntity = right === "newFleet" || right === undefined ? defaultEntity : right;

  // Resources
  const transportables = tables.P_Transportables.use()?.value ?? [];

  const rightInitialResourceCounts = useResourceCounts(rightEntity);
  const rightResourceCounts = useMemo(
    () =>
      transportables.reduce((acc, transportable) => {
        const entity = ResourceEntityLookup[transportable as EResource];
        const resourceCount = rightInitialResourceCounts.get(entity)?.resourceCount;
        const delta = deltas.get(entity) ?? 0n;
        const movingCount = moving?.side == "right" && moving?.entity === entity ? moving.count : 0n;
        const maxAtStorageCapacity = tables.Asteroid.has(rightEntity);
        let total = (resourceCount ?? 0n) + delta - movingCount;
        if (total <= 0n) return acc;

        if (maxAtStorageCapacity) {
          const storage = utils.getResourceCount(entity, rightEntity).resourceStorage;
          total = bigIntMin(storage, total);
        }
        acc.set(entity, total);
        return acc;
      }, new Map<Entity, bigint>()),
    [rightInitialResourceCounts, deltas, moving],
  );

  const leftInitialResourceCounts = useResourceCounts(left ?? defaultEntity);
  const leftResourceCounts = useMemo(
    () =>
      transportables.reduce((acc, transportable) => {
        const entity = ResourceEntityLookup[transportable as EResource];
        const resourceCount = leftInitialResourceCounts.get(entity)?.resourceCount ?? 0n;
        const delta = deltas.get(entity) ?? 0n;
        const movingCount = moving?.side == "left" && moving?.entity === entity ? moving.count : 0n;

        let total = (resourceCount ?? 0n) - delta - movingCount;
        if (total <= 0n) return acc;

        if (tables.Asteroid.has(left)) {
          const storage = utils.getResourceCount(entity, left ?? defaultEntity).resourceStorage;
          total = bigIntMin(storage, total);
        }

        acc.set(entity, total);
        return acc;
      }, new Map<Entity, bigint>()),
    [leftInitialResourceCounts, deltas, moving],
  );
  // Units

  const leftInitialUnitCounts = useUnitCounts(left);
  const rightInitialUnitCounts = useUnitCounts(rightEntity);

  const leftUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = leftInitialUnitCounts.get(unit) ?? 0n;
      const delta = deltas.get(unit) ?? 0n;
      const movingCount = moving?.side == "left" ? (moving?.entity === unit ? moving.count : 0n) : 0n;
      const total = count - delta - movingCount;
      if (total <= 0n) return acc;
      acc.set(unit, total);
      return acc;
    }, new Map<Entity, bigint>());
  }, [moving, leftInitialUnitCounts, deltas]);

  const rightUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = rightInitialUnitCounts.get(unit) ?? 0n;
      const delta = deltas.get(unit) ?? 0n;
      const movingCount = moving?.side == "right" ? (moving?.entity === unit ? moving.count : 0n) : 0n;
      const total = count + delta - movingCount;
      if (total <= 0n) return acc;
      acc.set(unit, total);
      return acc;
    }, new Map<Entity, bigint>());
  }, [moving, deltas, rightInitialUnitCounts]);

  const stopMoving = useCallback(
    (rightClick?: boolean) => {
      document.body.style.userSelect = "";
      if (!moving) return;

      if (rightClick && (!hovering || hovering === moving.side)) {
        const newCount = moving.count - parseResourceCount(moving.entity, "1");
        if (newCount <= 0n) {
          setMoving(null);
          setHovering(null);
          return;
        }
        setMoving({
          ...moving,
          count: newCount,
        });
        return;
      }
      if (!hovering || moving.side === hovering) {
        setMoving(null);
        setHovering(null);
        return;
      }
      const count = rightClick ? parseResourceCount(moving.entity, "1") : moving.count;
      const recipient = hovering === "left" ? left : right;
      let amountMoved = 0n;

      if (UnitStorages.has(moving.entity)) {
        const newMap = new Map(deltas);
        amountMoved = count;
        newMap.set(moving.entity, (deltas.get(moving.entity) ?? 0n) + (moving.side === "right" ? -count : count));
        setDeltas(newMap);
      } else {
        const recipientIsFleet = recipient === "newFleet" || !!tables.IsFleet.get(recipient)?.value;

        const fleetOwner = (
          recipientIsFleet && recipient !== "newFleet" ? tables.OwnedBy.get(recipient)?.value : undefined
        ) as Entity | undefined;

        let resourceStorage: bigint = 0n;
        let resourceCount: bigint = 0n;

        if (recipientIsFleet) {
          const unitCounts = moving.side === "left" ? rightUnitCounts : leftUnitCounts;
          resourceStorage = utils.getFleetStatsFromUnits(unitCounts, fleetOwner).cargo;
          const resourceCounts = moving.side === "left" ? rightResourceCounts : leftResourceCounts;
          resourceCount = [...resourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n);
        } else {
          resourceStorage = utils.getResourceCount(moving.entity, recipient as Entity).resourceStorage;
          const resourceCounts = moving.side === "left" ? rightResourceCounts : leftResourceCounts;
          resourceCount = resourceCounts.get(moving.entity) ?? 0n;
        }

        const outcome = count + resourceCount;
        amountMoved = bigIntMax(0n, resourceStorage < outcome ? resourceStorage - resourceCount : count);
        if (amountMoved < count) {
          flash(hovering);
        }

        const newMap = new Map(deltas);
        const newAmount = (deltas.get(moving.entity) ?? 0n) + (moving.side === "right" ? -amountMoved : amountMoved);
        if (newAmount == 0n) newMap.delete(moving.entity);
        else newMap.set(moving.entity, newAmount);
        setDeltas(newMap);
      }
      const formattedMin = parseResourceCount(moving.entity, "1");
      if (!rightClick || amountMoved === moving.count || moving.count === formattedMin) {
        setMoving(null);
        setHovering(null);
      } else {
        setMoving({
          ...moving,
          count: moving.count - formattedMin,
        });
      }
    },
    [hovering, moving, right, rightUnitCounts, rightResourceCounts, deltas],
  );

  const handleKeyDown = useCallback(
    (change: number) => {
      if (!moving) return;
      const initial = UnitStorages.has(moving.entity)
        ? ((moving.side === "left" ? leftUnitCounts : rightUnitCounts).get(moving.entity) ?? 0n)
        : ((moving.side === "left" ? leftResourceCounts : rightResourceCounts).get(moving.entity) ?? 0n);

      const negative = change < 0;
      const delta = parseResourceCount(moving.entity, `${Math.abs(change)}`);
      setMoving({
        ...moving,
        count: !negative
          ? bigIntMin(initial + moving.count, moving.count + delta)
          : bigIntMax(1n, moving.count - delta),
      });
    },
    [moving, leftResourceCounts, leftUnitCounts],
  );
  const api = useGame().COMMAND_CENTER;
  useEffect(() => {
    if (!api) return;

    const upListener = api.input.addListener("Up", () => handleKeyDown(100), true);
    const downListener = api.input.addListener("Down", () => handleKeyDown(-100), true);
    const leftListener = api.input.addListener("Left", () => handleKeyDown(-10), true);
    const rightListener = api.input.addListener("Right", () => handleKeyDown(10), true);

    return () => {
      upListener.dispose();
      downListener.dispose();
      leftListener.dispose();
      rightListener.dispose();
    };
  }, [api, handleKeyDown]);

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
        <TransferPane side="left" unitCounts={leftUnitCounts} resourceCounts={leftResourceCounts} />
        <div className="flex w-full justify-center items-end w-full">
          <div className="flex flex-col gap-4">
            <div className="relative flex gap-1">
              <TransferConfirm />

              <Hints />
            </div>
            <Button
              disabled={deltas.size === 0}
              variant="error"
              size="sm"
              className="w-full"
              onClick={() => setDeltas(new Map())}
            >
              Reset
            </Button>
          </div>
        </div>
        <TransferPane side="right" unitCounts={rightUnitCounts} resourceCounts={rightResourceCounts} />
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
    document.body,
  );
};

export default Transfer;

const Hints = () => {
  return (
    <div className="absolute right-0 translate-x-full translate-y-1/2 pl-2 flex items-center text-xs z-50">
      <div className="dropdown dropdown-top">
        <label tabIndex={0} className="btn btn-circle btn-ghost btn-xs">
          <FaInfoCircle size={16} />
        </label>
        <div
          tabIndex={0}
          className="absolute card compact dropdown-content z-[1] shadow bg-base-100 w-60 p-2 m-1 border border-secondary gap-1 right-0 grid grid-cols-[3fr_2fr]"
        >
          <p className="text-accent col-span-2">To select a fleet/resource</p>
          <span className="opacity-70">Left click:</span> select all
          <span className="opacity-70">Right click:</span> select one
          <hr className="opacity-70 col-span-2" />
          <p className="text-accent col-span-2">While selected</p>
          <span className="opacity-70">Left click:</span> drop all
          <span className="opacity-70">Right click:</span> drop one
          <span className="opacity-70">Up/Down Keys:</span> +/- 100
          <span className="opacity-70">Left/Right Keys:</span> +/- 10
        </div>
      </div>
    </div>
  );
};
