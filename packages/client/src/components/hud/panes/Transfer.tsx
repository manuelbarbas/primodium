import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { transferFleet } from "src/network/setup/contractCalls/fleetTransfer";
import { RESOURCE_SCALE, ResourceEntityLookup, TransactionQueueType, UnitStorages } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { getFleetStatsFromUnits } from "src/util/unit";
import { ResourceIcon } from "../modals/fleets/ResourceIcon";
import { TargetHeader } from "../spacerock-menu/TargetHeader";
import { FleetEntityHeader } from "./fleets/FleetHeader";

const TransferFromSide = ({
  entity,
  unitCounts,
  resourceCounts,
  setDragging,
  onMouseOver,
  onMouseLeave,
}: {
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}) => {
  const Header = components.IsFleet.use(entity)?.value ? FleetEntityHeader : TargetHeader;
  return (
    <div
      className="w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50"
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-12">
        <Header entity={entity} />
      </div>

      {/*Units to select from*/}
      {unitCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...unitCounts].map(([unit, count]) => {
            if (count <= 0n) return null;
            return (
              <ResourceIcon
                key={`from-unit-${unit}`}
                resource={unit}
                amount={count.toString()}
                setDragging={(e) => setDragging && setDragging(e, unit, count)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex-1 bg-neutral p-4 grid place-items-center">
          <p className="text-xs uppercase font-bold text-error/70 animate-pulse">No units</p>
        </div>
      )}

      {/*Resources to select from*/}
      {resourceCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...resourceCounts.entries()].map(([entity, count]) => {
            if (count / RESOURCE_SCALE <= 0n) return null;
            return (
              <ResourceIcon
                key={`from-resource-${entity}`}
                resource={entity as Entity}
                amount={formatResourceCount(entity as Entity, count, { fractionDigits: 0 })}
                setDragging={(e) => setDragging && setDragging(e, entity, count)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex-1 bg-neutral p-4 grid place-items-center ">
          <p className="text-xs uppercase font-bold text-error/70 animate-pulse">This rock has no resources</p>
        </div>
      )}
    </div>
  );
};

const TransferToSide = ({
  entity,
  unitCounts,
  resourceCounts,
  setDragging,
  clearUnit,
  clearResource,
  clearAll,
  onMouseOver,
  onMouseLeave,
  hovering,
}: {
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  clearResource?: (entity: Entity) => void;
  clearUnit?: (entity: Entity) => void;
  clearAll?: () => void;
  hovering?: boolean;
}) => {
  const Header = components.IsFleet.use(entity)?.value ? FleetEntityHeader : TargetHeader;
  return (
    <div
      className={`w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50 relative ${
        hovering ? "ring-2 ring-secondary" : ""
      }`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-12 text-sm w-full h-full font-bold grid place-items-center uppercase">
        <Header entity={entity} />
      </div>

      {/*Units sent*/}
      {unitCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...unitCounts.entries()].map(([unit, count]) =>
            UnitStorages.has(unit) ? (
              <ResourceIcon
                key={`to-unit-${unit}`}
                resource={unit as Entity}
                amount={count.toString()}
                onClear={clearUnit && (() => clearUnit(unit))}
                setDragging={(e) => setDragging && setDragging(e, unit, count)}
              />
            ) : null
          )}
        </div>
      ) : (
        <div className="flex-1 grid p-4 place-items-center bg-neutral">
          <p className="opacity-50 text-xs font-bold uppercase">Drag units to add them to your fleet</p>
        </div>
      )}

      {/*Resources sent*/}
      {resourceCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...resourceCounts.entries()].map(([entity, data]) =>
            UnitStorages.has(entity) ? null : (
              <ResourceIcon
                key={`to-resource-${entity}`}
                resource={entity as Entity}
                amount={formatResourceCount(entity as Entity, data, { fractionDigits: 0 })}
                onClear={clearResource && (() => clearResource(entity))}
                setDragging={(e) => setDragging && setDragging(e, entity, data)}
              />
            )
          )}
        </div>
      ) : (
        <div className="flex-1 grid p-4 place-items-center bg-neutral">
          <p className="opacity-50 text-xs font-bold uppercase">Drag resources to add them to your fleet</p>
        </div>
      )}
      <Button className="btn-primary btn-xs absolute bottom-1 right-2" onClick={clearAll}>
        Clear all
      </Button>
    </div>
  );
};

const Transfer = ({ from: initialFrom, to: initialTo }: { from: Entity; to: Entity }) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const [unitDelta, setUnitDelta] = useState<Map<Entity, bigint>>(new Map());
  const [resourceDelta, setResourceDelta] = useState<Map<Entity, bigint>>(new Map());

  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringArea, setHoveringArea] = useState<"from" | "to" | null>(null);
  const [keyDown, setKeyDown] = useState<"shift" | "ctrl" | null>();
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  // Resources
  const transportables = components.P_Transportables.use()?.value ?? [];

  const fromInitialResourceCounts = useFullResourceCounts(from);
  const fromResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = fromInitialResourceCounts.get(entity)?.resourceCount ?? 0n;
    const delta = resourceDelta.get(entity) ?? 0n;
    const draggingCount = dragging?.entity === entity ? dragging.count : 0n;
    const total = resourceCount - delta - draggingCount;
    if (total <= 0n) return acc;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());

  const toInitialResourceCounts = useFullResourceCounts(to);
  const toResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = toInitialResourceCounts.get(entity)?.resourceCount;
    const delta = resourceDelta.get(entity) ?? 0n;
    const total = (resourceCount ?? 0n) + delta;
    if (total == 0n) return acc;
    acc.set(entity, total);
    return acc;
  }, new Map<Entity, bigint>());

  // Units
  const fromInitialUnitCounts = useUnitCounts(from);
  const toInitialUnitCounts = useUnitCounts(to);

  const fromUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = fromInitialUnitCounts.get(unit) ?? 0n;
      const delta = unitDelta.get(unit) ?? 0n;
      const draggingCount = dragging?.entity === unit ? dragging.count : 0n;
      const total = count - delta - draggingCount;
      if (total > 0n) acc.set(unit, total);
      return acc;
    }, new Map<Entity, bigint>());
  }, [dragging, fromInitialUnitCounts, unitDelta]);

  const toUnitCounts = useMemo(() => {
    return [...UnitStorages].reduce((acc, unit) => {
      const count = toInitialUnitCounts.get(unit) ?? 0n;
      const delta = unitDelta.get(unit) ?? 0n;
      if (count + delta > 0n) acc.set(unit, count + delta);
      return acc;
    }, new Map<Entity, bigint>());
  }, [unitDelta, toInitialUnitCounts]);

  const initDragging = (e: React.MouseEvent, val: { from: "from" | "to"; entity: Entity; count: bigint }) => {
    document.body.style.userSelect = "none";
    setDragging(val);
    setDragLocation({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  };

  const stopDragging = useCallback(() => {
    document.body.style.userSelect = "";
    setDragging(null);
    if (hoveringArea === "to" && dragging) {
      if (UnitStorages.has(dragging.entity)) {
        const newMap = new Map(unitDelta);
        newMap.set(dragging.entity, (unitDelta.get(dragging.entity) ?? 0n) + dragging.count);
        setUnitDelta(newMap);
      } else {
        const newMap = new Map(resourceDelta);
        newMap.set(dragging.entity, (resourceDelta.get(dragging.entity) ?? 0n) + dragging.count);
        setResourceDelta(newMap);
      }
    }
    setHoveringArea(null);
    window.removeEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  }, [dragging, hoveringArea, resourceDelta, unitDelta]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setKeyDown("shift");
      } else if (e.key === "Meta" || e.key === "Control") {
        setKeyDown("ctrl");
      }
      if (!dragging) return;
      if (e.key === "e" || e.key === "E") {
        const delta = parseResourceCount(dragging.entity, e.key === "E" ? "10" : "1");
        setDragging({
          ...dragging,
          count: bigIntMin(dragging.count + delta),
        });
      } else if (e.key === "q" || e.key == "Q") {
        const delta = parseResourceCount(dragging.entity, e.key === "Q" ? "10" : "1");
        setDragging({ ...dragging, count: bigIntMax(0n, dragging.count - delta) });
      }
    },
    [dragging]
  );
  const mud = useMud();
  const handleSubmit = () => {
    transferFleet(mud, from, to, { resources: resourceDelta, units: unitDelta });
    setUnitDelta(new Map());
    setResourceDelta(new Map());
  };

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift" || e.key === "Control" || e.key === "Meta") {
      setKeyDown(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, stopDragging]);

  const { disabled, submitMessage } = useMemo(() => {
    if (components.IsFleet.get(to)) {
      const cargo = getFleetStatsFromUnits(toUnitCounts).cargo;
      if (cargo < [...toResourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n))
        return { disabled: true, submitMessage: "Cargo capacity exceeded" };
    }
    if (unitDelta.size + resourceDelta.size === 0) return { disabled: true, submitMessage: "Transfer" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [resourceDelta, to, toResourceCounts, toUnitCounts, unitDelta]);

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      {dragging && (
        <div className={`fixed pointer-events-none z-10`} style={{ left: dragLocation.x, top: dragLocation.y }}>
          <ResourceIcon
            resource={dragging.entity}
            amount={formatResourceCount(dragging.entity, dragging.count, { fractionDigits: 0 })}
          />
        </div>
      )}

      {/*Header*/}
      <div className="flex items-center justify-between gap-2 w-full uppercase font-bold text-xs text-left">
        <p className="opacity-50">Transfer</p>
      </div>

      <div
        className="grid grid-cols-[1fr_3rem_1fr]  w-full h-full"
        onMouseEnter={() => dragging && setHoveringArea("from")}
        onMouseLeave={() => setHoveringArea(null)}
      >
        {/*Left Side */}
        <TransferFromSide
          entity={from}
          unitCounts={fromUnitCounts}
          resourceCounts={fromResourceCounts}
          setDragging={(e: React.MouseEvent, entity: Entity, count: bigint) =>
            initDragging(e, {
              from: "to",
              entity,
              count: keyDown == "shift" ? count : keyDown == "ctrl" ? count / 2n : parseResourceCount(entity, "1"),
            })
          }
        />
        <div className="grid grid-rows-3 h-full w-full place-items-center">
          <div className="grid place-items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-secondary rotate-90"></div>
          </div>
          <Button
            className="btn-xs btn-primary"
            onClick={() => {
              setUnitDelta(new Map());
              setResourceDelta(new Map());
              setFrom(to);
              setTo(from);
            }}
          >
            <FaExchangeAlt />
          </Button>
          <div className="grid place-items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-secondary rotate-90"></div>
          </div>
        </div>

        {/* Right Side */}
        <TransferToSide
          entity={to}
          unitCounts={toUnitCounts}
          resourceCounts={toResourceCounts}
          clearResource={(entity) => {
            const newMap = new Map(resourceDelta);
            newMap.delete(entity);
            setResourceDelta(newMap);
          }}
          clearUnit={(entity) => {
            const newMap = new Map(unitDelta);
            newMap.delete(entity);
            setUnitDelta(newMap);
          }}
          clearAll={() => {
            setUnitDelta(new Map());
            setResourceDelta(new Map());
          }}
          onMouseOver={() => dragging && setHoveringArea("to")}
          onMouseLeave={() => setHoveringArea(null)}
          hovering={hoveringArea === "to"}
        />
      </div>
      <div className="flex gap-4">
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.CreateFleet, selectedRock)}>
          <Button className="btn-primary w-48" disabled={disabled} onClick={handleSubmit}>
            {submitMessage}
          </Button>
        </TransactionQueueMask>
      </div>
    </div>
  );
};

export default Transfer;
