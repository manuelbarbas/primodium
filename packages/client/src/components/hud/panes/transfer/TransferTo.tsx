import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import React, { useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { formatResourceCount } from "src/util/number";
import { getUnitStats } from "src/util/unit";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";
import { FleetEntityHeader, FleetHeader } from "../fleets/FleetHeader";

export const TransferTo = (props: {
  sameOwner?: boolean;
  entity: Entity | "newFleet";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  deltas?: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  remove?: () => void;
  clearResource?: (entity: Entity) => void;
  clearUnit?: (entity: Entity) => void;
  clearAll?: () => void;
  hovering?: boolean;
}) => {
  const isFleet = props.entity !== "newFleet" && components.IsFleet.has(props.entity);
  const selectedRock = components.SelectedRock.use()?.value;
  const noUnitsOrResources = props.unitCounts.size === 0 && props.resourceCounts.size === 0;
  const Header = useMemo(() => {
    if (props.entity !== "newFleet") {
      return isFleet ? <FleetEntityHeader entity={props.entity} /> : <TargetHeader entity={props.entity} />;
    }
    if (!selectedRock) throw new Error("No selected rock");
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    props.unitCounts.forEach((count, unit) => {
      const unitData = getUnitStats(unit as Entity, selectedRock);
      data.attack += unitData.ATK * count;
      data.defense += unitData.DEF * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CRG * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });

    return <FleetHeader title="New Fleet" {...data} />;
  }, [isFleet, props.entity, props.unitCounts, selectedRock]);

  return (
    <div
      className={`w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50 relative ${
        props.hovering ? "ring-2 ring-secondary" : ""
      }`}
      onMouseOver={props.onMouseOver}
      onMouseLeave={props.onMouseLeave}
    >
      <div className="relative h-12 text-sm w-full flex justify-center font-bold gap-1">
        {Header}
        {props.remove && (
          <Button className="absolute -top-1 -right-1 btn-error p-1 btn-xs" onClick={props.remove}>
            <FaTimes />
          </Button>
        )}
      </div>

      {/*Units*/}
      <div className="relative flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        {Array(8)
          .fill(0)
          .map((_, index) => {
            if (index >= props.unitCounts.size)
              return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
            const [unit, count] = [...props.unitCounts.entries()][index];
            const delta = props.deltas?.get(unit);
            return (
              <ResourceIcon
                key={`to-unit-${unit}`}
                className="bg-neutral/50"
                resource={unit as Entity}
                amount={count.toString()}
                delta={delta}
                onClear={props.clearUnit && (() => props.clearUnit && props.clearUnit(unit))}
              />
            );
          })}
      </div>

      {/*Resources*/}
      <div className="relative flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        {Array(8)
          .fill(0)
          .map((_, index) => {
            if (index >= props.resourceCounts.size)
              return <div key={`resource-blank-${index}`} className=" w-full h-full bg-white/10 opacity-50 " />;
            const [entity, count] = [...props.resourceCounts.entries()][index];
            const delta = props.deltas?.get(entity);
            return (
              <ResourceIcon
                key={`to-resource-${entity}`}
                className="bg-neutral/50"
                resource={entity as Entity}
                delta={delta}
                amount={formatResourceCount(entity as Entity, count, { fractionDigits: 0 })}
                onClear={props.clearResource && (() => props.clearResource && props.clearResource(entity))}
              />
            );
          })}
      </div>
      {props.clearAll && (
        <Button
          disabled={noUnitsOrResources}
          className="btn-primary btn-xs absolute bottom-1 right-2"
          onClick={props.clearAll}
        >
          Clear all
        </Button>
      )}
    </div>
  );
};
