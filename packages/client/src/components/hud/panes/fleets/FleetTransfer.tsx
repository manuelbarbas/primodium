import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
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
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";

export const FleetTransfer = ({ from, to }: { from: Entity; to: Entity }) => {
  const [unitDelta, setUnitDelta] = useState<Record<Entity, bigint>>({});
  const [resourceDelta, setResourceDelta] = useState<Record<Entity, bigint>>({});

  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringArea, setHoveringArea] = useState<"from" | "to" | null>(null);
  const [keyDown, setKeyDown] = useState<"shift" | "ctrl" | null>();
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const transportables = components.P_Transportables.use()?.value ?? [];
  const fromResourceCounts = useFullResourceCounts(from);

  const fromInitialResourceCounts = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = fromResourceCounts.get(entity)?.resourceCount;
    if (!resourceCount) return acc;
    acc[entity] = resourceCount;
    return acc;
  }, {} as Record<Entity, bigint>);

  const toResourceCounts = useFullResourceCounts(to);
  const toInitialResourceCounts = useMemo(() => {
    const counts: Record<string, bigint> = {};
    Object.entries(resourceDelta).forEach(([entity, count]) => {
      counts[entity] = (toResourceCounts.get(entity as Entity)?.resourceCount ?? 0n) + count;
    });
    return counts;
  }, [resourceDelta, toResourceCounts]);
  const fromInitialUnitCounts = useUnitCounts(from);
  const toInitialUnitCounts = useUnitCounts(to);

  const toFinalUnitCounts = useMemo(() => {
    const counts: Record<string, bigint> = {};
    Object.entries(unitDelta).forEach(([entity, count]) => {
      counts[entity] = (toInitialUnitCounts.get(entity as Entity) ?? 0n) + count;
    });
    return counts;
  }, [unitDelta, toInitialUnitCounts]);

  const toFinalResourceCounts = useMemo(() => {
    const counts: Record<string, bigint> = {};
    Object.entries(resourceDelta).forEach(([entity, count]) => {
      counts[entity] = (toInitialResourceCounts[entity as Entity] ?? 0n) + count;
    });
    return counts;
  }, [resourceDelta, toInitialResourceCounts]);

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
        setUnitDelta({
          ...unitDelta,
          [dragging.entity]: (unitDelta[dragging.entity] ?? 0n) + dragging.count,
        });
      } else {
        setResourceDelta({
          ...resourceDelta,
          [dragging.entity]: (resourceDelta[dragging.entity] ?? 0n) + dragging.count,
        });
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
      const cargo = getFleetStatsFromUnits(toFinalUnitCounts).cargo;
      if (cargo > Object.entries(toFinalResourceCounts).reduce((acc, [, count]) => acc + count, 0n))
        return { disabled: true, submitMessage: "Cargo capacity exceeded" };
    }
    if (Object.entries(unitDelta).length + Object.entries(resourceDelta).length === 0)
      return { disabled: true, submitMessage: "Transfer" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [resourceDelta, to, toFinalResourceCounts, toFinalUnitCounts, unitDelta]);

  return (
    <Navigator.Screen title="CreateFleet" className="w-full h-full flex flex-col gap-2 p-2">
      {dragging && (
        <div className={`fixed pointer-events-none z-10`} style={{ left: dragLocation.x, top: dragLocation.y }}>
          <ResourceIcon
            resource={dragging.entity}
            amount={formatResourceCount(dragging.entity, dragging.count, { fractionDigits: 0 })}
          />
        </div>
      )}

      {/*Create Fleet Header*/}
      <div className="flex items-center justify-between gap-2 w-full uppercase font-bold text-xs text-left">
        <p className="opacity-50">Create Fleet</p>
      </div>

      <div
        className="grid grid-cols-[1fr_5px_1fr]  w-full h-full gap-4"
        onMouseEnter={() => dragging && setHoveringArea("from")}
        onMouseLeave={() => setHoveringArea(null)}
      >
        {/*Left Side */}
        <div className="w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50">
          <div className="h-12">
            <TargetHeader />
          </div>

          {/*Units to select from*/}
          {fromInitialUnitCounts.size > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {[...fromInitialUnitCounts].map(([unit, rawCount]) => {
                const count =
                  rawCount - (dragging?.entity === unit ? dragging?.count ?? 0n : 0n) - (unitDelta[unit] ?? 0n);
                if (count <= 0n) return null;
                return (
                  <ResourceIcon
                    key={`from-unit-${unit}`}
                    resource={unit}
                    amount={count.toString()}
                    setDragging={(e: React.MouseEvent, entity: Entity) =>
                      initDragging(e, {
                        from: "to",
                        entity,
                        count: keyDown == "shift" ? count : keyDown == "ctrl" ? count / 2n : 1n,
                      })
                    }
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
          {Object.entries(fromInitialResourceCounts).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(fromInitialResourceCounts).map(([entity, data]) => {
                const count =
                  data -
                  (dragging?.entity === entity ? dragging?.count ?? 0n : 0n) -
                  (resourceDelta[entity as Entity] ?? 0n);

                if (count / RESOURCE_SCALE <= 0n) return null;
                return (
                  <ResourceIcon
                    key={`from-resource-${entity}`}
                    resource={entity as Entity}
                    amount={formatResourceCount(entity as Entity, count, { fractionDigits: 0 })}
                    setDragging={(e: React.MouseEvent, entity: Entity) =>
                      initDragging(e, {
                        from: "from",
                        entity,
                        count:
                          keyDown == "shift" ? count : keyDown == "ctrl" ? count / 2n : parseResourceCount(entity, "1"),
                      })
                    }
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

        <div className="grid grid-rows-2 h-full">
          <div className="grid place-items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-secondary rotate-90 -translate-x-1/3"></div>
          </div>
          <div className="grid place-items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-secondary rotate-90 -translate-x-1/3"></div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className={`w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50 relative ${
            hoveringArea === "to" ? "ring-2 ring-secondary" : ""
          }`}
          onMouseOver={() => dragging && setHoveringArea("to")}
          onMouseLeave={() => setHoveringArea(null)}
        >
          <div className="h-12 text-sm w-full h-full font-bold grid place-items-center uppercase">
            {/* <FleetHeader title={"NEW FLEET"} {...fleetStats} /> */}
          </div>

          {/*Units sent*/}
          {Object.entries(toFinalUnitCounts).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(toFinalUnitCounts).map(([unit, count]) =>
                UnitStorages.has(unit as Entity) ? (
                  <ResourceIcon
                    key={`to-unit-${unit}`}
                    resource={unit as Entity}
                    amount={count.toString()}
                    onClear={(entity) => {
                      delete unitDelta[entity];
                      setUnitDelta({ ...unitDelta });
                    }}
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
          {Object.entries(toFinalResourceCounts).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(toFinalResourceCounts).map(([entity, data]) =>
                UnitStorages.has(entity as Entity) ? null : (
                  <ResourceIcon
                    key={`to-resource-${entity}`}
                    resource={entity as Entity}
                    amount={formatResourceCount(entity as Entity, data, { fractionDigits: 0 })}
                    onClear={(entity) => {
                      delete resourceDelta[entity];
                      setResourceDelta({ ...resourceDelta });
                    }}
                  />
                )
              )}
            </div>
          ) : (
            <div className="flex-1 grid p-4 place-items-center bg-neutral">
              <p className="opacity-50 text-xs font-bold uppercase">Drag resources to add them to your fleet</p>
            </div>
          )}
          <Button
            className="btn-primary btn-xs absolute bottom-1 right-2"
            onClick={() => {
              setUnitDelta({});
              setResourceDelta({});
            }}
            disabled={Object.entries(resourceDelta).length + Object.entries(unitDelta).length === 0}
          >
            Clear all
          </Button>
        </div>
      </div>
      <div className="flex gap-4">
        <Navigator.BackButton className="absolute left-0 bottom-0">Back</Navigator.BackButton>
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.CreateFleet, selectedRock)}>
          <Button className="btn-primary w-48" disabled={disabled} onClick={handleSubmit}>
            {submitMessage}
          </Button>
        </TransactionQueueMask>
      </div>
    </Navigator.Screen>
  );
};
