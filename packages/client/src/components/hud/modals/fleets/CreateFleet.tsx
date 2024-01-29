import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { createFleet } from "src/network/setup/contractCalls/createFleet";
import { RESOURCE_SCALE, ResourceEntityLookup, TransactionQueueType, UnitStorages } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { getUnitStats } from "src/util/unit";
import { Hex } from "viem";
import { FleetHeader } from "../../panes/fleets/FleetHeader";
import { useFleetNav } from "../../panes/fleets/Fleets";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";
import { ResourceIcon } from "./ResourceIcon";

const CreateFleet: React.FC = () => {
  const [fleetUnitCounts, setFleetUnitCounts] = useState<Record<Entity, bigint>>({});
  const [fleetResourceCounts, setFleetResourceCounts] = useState<Record<Entity, bigint>>({});

  const Nav = useFleetNav();
  const [dragging, setDragging] = useState<{ entity: Entity; count: bigint } | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringArea, setHoveringArea] = useState<"from" | "to" | null>(null);
  const [keyDown, setKeyDown] = useState<"shift" | "ctrl" | null>();
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;
  const fleetStats = useMemo(() => {
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

    Object.entries(fleetUnitCounts).forEach(([unit, count]) => {
      const unitData = getUnitStats(unit as Entity, selectedRock);
      data.attack += unitData.ATK * count;
      data.defense += unitData.DEF * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CRG * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });
    return data;
  }, [fleetUnitCounts, selectedRock]);

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
  const maxFleets =
    components.ResourceCount.getWithKeys({ entity: selectedRock as Hex, resource: EResource.U_MaxMoves })?.value ?? 0n;

  const initDragging = (e: React.MouseEvent, val: { entity: Entity; count: bigint }) => {
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
        console.log("adding unit to fleet", dragging.entity, dragging.count, fleetUnitCounts[dragging.entity]);
        setFleetUnitCounts({
          ...fleetUnitCounts,
          [dragging.entity]: (fleetUnitCounts[dragging.entity] ?? 0n) + dragging.count,
        });
      } else {
        setFleetResourceCounts({
          ...fleetResourceCounts,
          [dragging.entity]: (fleetResourceCounts[dragging.entity] ?? 0n) + dragging.count,
        });
      }
    }
    setHoveringArea(null);
    window.removeEventListener("mousemove", (e) => setDragLocation({ x: e.clientX, y: e.clientY }));
  }, [dragging, fleetResourceCounts, fleetUnitCounts, hoveringArea]);

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
        const maxCount = UnitStorages.has(dragging.entity)
          ? units
            ? units.counts[units.units.indexOf(dragging.entity)]
            : 0n
          : transportableResources[dragging.entity];
        setDragging({
          ...dragging,
          count: bigIntMin(maxCount, dragging.count + delta),
        });
      } else if (e.key === "q" || e.key == "Q") {
        const delta = parseResourceCount(dragging.entity, e.key === "Q" ? "10" : "1");
        setDragging({ ...dragging, count: bigIntMax(0n, dragging.count - delta) });
      }
    },
    [dragging, transportableResources, units]
  );
  const mud = useMud();
  const handleSubmit = () => {
    createFleet(mud, selectedRock, fleetUnitCounts, fleetResourceCounts);
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
    if (maxFleets === 0n) return { disabled: true, submitMessage: "No Fleets Left" };
    if (Object.entries(fleetUnitCounts).length + Object.entries(fleetResourceCounts).length === 0)
      return { disabled: true, submitMessage: "Create Fleet" };
    if (Object.entries(fleetResourceCounts).reduce((acc, curr) => curr[1] + acc, 0n) > fleetStats.cargo)
      return { disabled: true, submitMessage: "Not Enough Cargo" };
    return { disabled: false, submitMessage: "Create Fleet" };
  }, [fleetResourceCounts, fleetStats.cargo, fleetUnitCounts, maxFleets]);

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
          {units && units.units.length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {units.units.map((unit) => {
                const count =
                  units.counts[units.units.indexOf(unit)] -
                  (dragging?.entity === unit ? dragging?.count ?? 0n : 0n) -
                  (fleetUnitCounts[unit] ?? 0n);
                if (count <= 0n) return null;
                return (
                  <ResourceIcon
                    key={`from-unit-${unit}`}
                    resource={unit}
                    amount={count.toString()}
                    setDragging={(e: React.MouseEvent, entity: Entity) =>
                      initDragging(e, {
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
              <p className="text-xs uppercase font-bold text-error/70 animate-pulse">This rock has no units</p>
            </div>
          )}

          {/*Resources to select from*/}
          {Object.entries(transportableResources).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(transportableResources).map(([entity, data]) => {
                const count =
                  data -
                  (dragging?.entity === entity ? dragging?.count ?? 0n : 0n) -
                  (fleetResourceCounts[entity as Entity] ?? 0n);

                if (count / RESOURCE_SCALE <= 0n) return null;
                return (
                  <ResourceIcon
                    key={`from-resource-${entity}`}
                    resource={entity as Entity}
                    amount={formatResourceCount(
                      entity as Entity,
                      data -
                        (dragging?.entity === entity ? dragging?.count ?? 0n : 0n) -
                        (fleetResourceCounts[entity as Entity] ?? 0n),
                      { fractionDigits: 0 }
                    )}
                    setDragging={(e: React.MouseEvent, entity: Entity) =>
                      initDragging(e, {
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
            <FleetHeader title={"NEW FLEET"} {...fleetStats} />
          </div>

          {/*Units sent*/}
          {Object.entries(fleetUnitCounts).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(fleetUnitCounts).map(([unit, count]) =>
                UnitStorages.has(unit as Entity) ? (
                  <ResourceIcon
                    key={`to-unit-${unit}`}
                    resource={unit as Entity}
                    amount={count.toString()}
                    onClear={(entity) => {
                      delete fleetUnitCounts[entity];
                      setFleetUnitCounts({ ...fleetUnitCounts });
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
          {Object.entries(fleetResourceCounts).length > 0 ? (
            <div className="flex-1 flex flex-col bg-neutral p-4 grid grid-cols-4 grid-rows-2 gap-2">
              {Object.entries(fleetResourceCounts).map(([entity, data]) =>
                UnitStorages.has(entity as Entity) ? null : (
                  <ResourceIcon
                    key={`to-resource-${entity}`}
                    resource={entity as Entity}
                    amount={formatResourceCount(entity as Entity, data, { fractionDigits: 0 })}
                    onClear={(entity) => {
                      delete fleetResourceCounts[entity];
                      setFleetResourceCounts({ ...fleetResourceCounts });
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
              setFleetUnitCounts({});
              setFleetResourceCounts({});
            }}
            disabled={Object.entries(fleetUnitCounts).length + Object.entries(fleetResourceCounts).length === 0}
          >
            Clear all
          </Button>
        </div>
      </div>
      <div className="flex gap-4 w-full justify-center items-center relative">
        <Nav.BackButton className="absolute left-0 bottom-0">Back</Nav.BackButton>
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.CreateFleet, selectedRock)}>
          <Button className="btn-primary w-48" disabled={disabled} onClick={handleSubmit}>
            {submitMessage}
          </Button>
        </TransactionQueueMask>
      </div>
    </div>
  );
};

export default CreateFleet;
