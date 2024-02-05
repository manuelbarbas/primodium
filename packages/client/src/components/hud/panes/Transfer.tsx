import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { transferFleet } from "src/network/setup/contractCalls/fleetTransfer";
import { EntityType, ResourceEntityLookup, TransactionQueueType, UnitStorages } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { getFullResourceCount } from "src/util/resource";
import { getFleetStatsFromUnits } from "src/util/unit";
import { Hex } from "viem";
import { ResourceIcon } from "../modals/fleets/ResourceIcon";
import { TargetHeader } from "../spacerock-menu/TargetHeader";
import { FleetEntityHeader } from "./fleets/FleetHeader";

const TransferSide = (props: {
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  remove?: () => void;
  clearResource?: (entity: Entity) => void;
  clearUnit?: (entity: Entity) => void;
  clearAll?: () => void;
  hovering?: boolean;
}) => {
  const isFleet = components.IsFleet.get(props.entity)?.value;
  const Header = isFleet ? (
    <FleetEntityHeader entity={props.entity} />
  ) : (
    <TargetHeader entity={props.entity} showHousing />
  );
  return (
    <div
      className={`w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50 relative ${
        props.hovering ? "ring-2 ring-secondary" : ""
      }`}
      onMouseOver={props.onMouseOver}
      onMouseLeave={props.onMouseLeave}
    >
      <div className="h-12 text-sm w-full flex font-bold gap-1">
        {Header}
        {props.remove && (
          <Button className="btn-error p-1 btn-xs h-full" onClick={props.remove}>
            <FaTimes className="w-2" />
          </Button>
        )}
      </div>

      {/*Units*/}
      {props.unitCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...props.unitCounts.entries()].map(([unit, count]) =>
            UnitStorages.has(unit) ? (
              <ResourceIcon
                key={`to-unit-${unit}`}
                resource={unit as Entity}
                amount={count.toString()}
                onClear={props.clearUnit && (() => props.clearUnit && props.clearUnit(unit))}
                setDragging={(e) => props.setDragging && props.setDragging(e, unit, count)}
              />
            ) : null
          )}
        </div>
      ) : (
        <div className="flex-1 grid p-4 place-items-center bg-neutral">
          <p className="opacity-50 text-xs font-bold uppercase">This {isFleet ? "fleet" : "rock"} has no units</p>
        </div>
      )}

      {/*Resources*/}
      {props.resourceCounts.size > 0 ? (
        <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
          {[...props.resourceCounts.entries()].map(([entity, data]) =>
            UnitStorages.has(entity) ? null : (
              <ResourceIcon
                key={`to-resource-${entity}`}
                resource={entity as Entity}
                amount={formatResourceCount(entity as Entity, data, { fractionDigits: 0 })}
                onClear={props.clearResource && (() => props.clearResource && props.clearResource(entity))}
                setDragging={(e) => props.setDragging && props.setDragging(e, entity, data)}
              />
            )
          )}
        </div>
      ) : (
        <div className="flex-1 grid p-4 place-items-center bg-neutral">
          <p className="opacity-50 text-xs font-bold uppercase">This {isFleet ? "fleet" : "rock"} has no resources</p>
        </div>
      )}
      {props.clearAll && (
        <Button className="btn-primary btn-xs absolute bottom-1 right-2" onClick={props.clearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
};

const Select = ({
  rockEntity,
  activeEntity,
  setEntity,
}: {
  rockEntity: Entity;
  activeEntity?: Entity;
  setEntity: (entity: Entity) => void;
}) => {
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

const Transfer = ({ from: initialFrom, to: initialTo }: { from?: Entity | undefined; to?: Entity | undefined }) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const [unitDelta, setUnitDelta] = useState<Map<Entity, bigint>>(new Map());
  const [resourceDelta, setResourceDelta] = useState<Map<Entity, bigint>>(new Map());

  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringArea, setHoveringArea] = useState<"from" | "to" | null>(null);
  const [keyDown, setKeyDown] = useState<"shift" | "ctrl" | null>();
  const selectedRock = components.ActiveRock.use()?.value;

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
    if (!from || !to) return;
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
    } else {
      const { resourceCount } = getFullResourceCount(EntityType.Housing);
      const housingUsed = [...toUnitCounts.entries()].reduce((acc, [entity, count]) => {
        const level =
          components.UnitLevel.getWithKeys({ entity: selectedRock as Hex, unit: entity as Hex })?.value ?? 0n;
        const requiredResources = components.P_RequiredResources.getWithKeys({ prototype: entity as Hex, level });
        if (!requiredResources || !requiredResources.resources.includes(EResource.U_Housing)) return acc;
        return acc + requiredResources.amounts[requiredResources.resources.indexOf(EResource.U_Housing)] * count;
      }, 0n);
      if (housingUsed > resourceCount) return { disabled: true, submitMessage: "Housing capacity exceeded" };
    }
    if (unitDelta.size + resourceDelta.size === 0) return { disabled: true, submitMessage: "Transfer" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [resourceDelta.size, selectedRock, to, toResourceCounts, toUnitCounts, unitDelta.size]);

  if (!selectedRock) return <div className="w-full h-full flex justify-center items-center">Select a rock</div>;
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
        {from ? (
          <TransferSide
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
            remove={() => {
              setFrom(undefined);
              setUnitDelta(new Map());
              setResourceDelta(new Map());
            }}
          />
        ) : (
          <Select rockEntity={selectedRock} activeEntity={to} setEntity={setFrom} />
        )}

        {/*Middle*/}
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
        {to ? (
          <TransferSide
            entity={to}
            unitCounts={toUnitCounts}
            resourceCounts={toResourceCounts}
            remove={() => {
              setTo(undefined);
              setUnitDelta(new Map());
              setResourceDelta(new Map());
            }}
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
        ) : (
          <Select rockEntity={selectedRock} activeEntity={from} setEntity={setTo} />
        )}
      </div>
      <div className="flex justify-center gap-4">
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
