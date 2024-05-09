import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import React, { useEffect, useMemo } from "react";
import { components } from "src/network/components";
import { getUnitStats } from "src/util/unit";
import { ResourceIcon } from "./ResourceIcon";
import { hydrateFleetData } from "src/network/sync/indexer";
import { useMud } from "src/hooks";
import { TransferSelect } from "@/components/hud/command/transfer/TransferSelect";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { Card, GlassCard, SecondaryCard } from "@/components/core/Card";
import { AsteroidCard } from "@/components/hud/command/AsteroidCard";
import { _FleetCard } from "@/components/hud/command/FleetCard";
import { entityToFleetName } from "@/util/name";
import { cn } from "@/util/client";
import { parseResourceCount } from "@/util/number";

export const TransferPane = (props: {
  selectPlacement?: "top-right" | "top-left";
  type: "from" | "to";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { to, setTo, from, setFrom } = useTransfer();
  const entity = props.type === "to" ? to : from;

  return (
    <GlassCard className={`w-full h-full`}>
      <TransferSelect
        placement={props.selectPlacement}
        handleSelect={props.type === "from" ? setFrom : setTo}
        showNewFleet={props.type === "to"}
        hideNotOwned={props.type === "from"}
      />
      {!entity && (
        <Card noDecor className="w-full h-full">
          <p className="h-full w-full grid place-items-center opacity-80 text-xs">Select a fleet or asteroid</p>
        </Card>
      )}
      {!!entity && (
        <_TransferPane
          entity={entity}
          type={props.type}
          unitCounts={props.unitCounts}
          resourceCounts={props.resourceCounts}
        />
      )}
    </GlassCard>
  );
};

export const _TransferPane = (props: {
  entity: Entity | "newFleet";
  type: "from" | "to";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  // onMouseOver?: (e: React.MouseEvent) => void;
  // onMouseLeave?: (e: React.MouseEvent) => void;
  // clearResource?: (entity: Entity) => void;
  // clearUnit?: (entity: Entity) => void;
  // clearAll?: () => void;
  // hovering?: boolean;
}) => {
  const { from, deltas, moving, setHovering, setMoving, hovering } = useTransfer();
  const selectedRock = components.SelectedRock.use()?.value;
  const mud = useMud();
  const newFleet = props.entity === "newFleet";
  const isFleet = !newFleet && components.IsFleet.has(props.entity as Entity);
  const Header = useMemo(() => {
    if (!isFleet && props.entity !== "newFleet") {
      return <AsteroidCard entity={props.entity} />;
    }
    const data = { title: "New Fleet", attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    const ownerRock = !newFleet ? components.OwnedBy.get(props.entity as Entity)?.value : undefined;

    if (!ownerRock) return <></>;

    props.unitCounts.forEach((count, unit) => {
      const unitData = getUnitStats(unit as Entity, ownerRock as Entity);
      data.attack += unitData.ATK * count;
      data.defense += unitData.CTR * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CGO * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });

    let owner: Entity | undefined = undefined;

    if (!newFleet) {
      data.title = entityToFleetName(props.entity as Entity);
      owner = components.OwnedBy.get(props.entity as Entity)?.value as Entity | undefined;
    }

    return (
      <_FleetCard stats={data} home={owner} destination={selectedRock} stance={newFleet ? "In Hangar" : "Orbiting"} />
    );
  }, [isFleet, props.entity, props.unitCounts, newFleet, from, selectedRock]);

  useEffect(() => {
    if (props.entity === "newFleet" || !components.IsFleet.get(props.entity)?.value) return;

    hydrateFleetData(props.entity, mud);
  }, [props.entity, mud]);

  const onMouseOver = () => {
    if (!moving) return;
    if (props.type === "from") {
      setHovering("from");
    } else {
      setHovering("to");
    }
  };
  return (
    <Card
      noDecor
      className={cn("w-full h-full relative", hovering === props.type ? "ring ring-secondary" : "")}
      onMouseOver={onMouseOver}
      onMouseLeave={() => setHovering(null)}
    >
      <div className="grid grid-rows-[10rem_1fr_1.5fr] gap-2 h-full">
        <div className="relative text-sm w-full flex justify-center font-bold gap-1">{Header}</div>

        {/*Units*/}
        <SecondaryCard className="grid grid-cols-4 grid-rows-2 gap-1">
          {Array(8)
            .fill(0)
            .map((_, index) => {
              if (index >= props.unitCounts.size)
                return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
              const [unit, count] = [...props.unitCounts.entries()][index];
              const delta = deltas?.get(unit) ?? 0n;
              const onClick = () => {
                console.log("moving", { from: props.type, entity: unit, count: count });
                setMoving({
                  from: props.type,
                  entity: unit,
                  count: count,
                });
              };
              return (
                <ResourceIcon
                  key={`to-unit-${unit}`}
                  onClick={onClick}
                  size="sm"
                  resource={unit as Entity}
                  count={count}
                  delta={delta}
                />
              );
            })}
        </SecondaryCard>

        {/*Resources*/}

        <SecondaryCard className="grid grid-cols-4 grid-rows-3 gap-1">
          {Array(10)
            .fill(0)
            .map((_, index) => {
              if (index >= props.resourceCounts.size)
                return <div key={`resource-blank-${index}`} className=" w-full h-full bg-white/10 opacity-50 " />;
              const [entity, count] = [...props.resourceCounts.entries()][index];
              const delta = deltas?.get(entity) ?? 0n;
              const onClick = (aux?: boolean) => {
                const countMoved = aux ? parseResourceCount(entity, "1") : count;
                setMoving({
                  from: props.type,
                  entity: entity,
                  count: countMoved,
                });
              };
              return (
                <ResourceIcon
                  onClick={onClick}
                  key={`to-resource-${entity}`}
                  size="sm"
                  className="bg-neutral/50"
                  resource={entity as Entity}
                  delta={delta}
                  count={count}
                />
              );
            })}
        </SecondaryCard>
      </div>
    </Card>
  );
};
