import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import React, { useEffect, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { getUnitStats } from "src/util/unit";
import { ResourceIcon } from "./ResourceIcon";
import { hydrateFleetData } from "src/network/sync/indexer";
import { useMud } from "src/hooks";
import { TransferSelect } from "@/components/hud/command/transfer/TransferSelect";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { Card, GlassCard, SecondaryCard } from "@/components/core/Card";
import { AsteroidCard } from "@/components/hud/command/AsteroidCard";
import { FleetCard } from "@/components/hud/command/FleetCard";

export const TransferTo = (props: { unitCounts: Map<Entity, bigint>; resourceCounts: Map<Entity, bigint> }) => {
  const { to, setTo } = useTransfer();

  return (
    <GlassCard className={`w-full h-full`}>
      <TransferSelect handleSelect={setTo} showNewFleet />
      {!to && (
        <Card noDecor className="w-full h-full">
          <p className="h-full w-full grid place-items-center opacity-80 text-xs">Select a fleet or asteroid</p>
        </Card>
      )}
      {!!to && <_TransferTo entity={to} unitCounts={props.unitCounts} resourceCounts={props.resourceCounts} />}
    </GlassCard>
  );
};

export const _TransferTo = (props: {
  entity: Entity | "newFleet";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  // onMouseOver?: (e: React.MouseEvent) => void;
  // onMouseLeave?: (e: React.MouseEvent) => void;
  // clearResource?: (entity: Entity) => void;
  // clearUnit?: (entity: Entity) => void;
  // clearAll?: () => void;
  // hovering?: boolean;
}) => {
  const { from, setTo, setDelta, deltas } = useTransfer();
  const mud = useMud();
  const isFleet = props.entity !== "newFleet" && components.IsFleet.has(props.entity);
  const Header = useMemo(() => {
    if (!isFleet && props.entity !== "newFleet") {
      return <AsteroidCard entity={props.entity} />;
    }
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    const ownerRock = props.entity !== "newFleet" ? components.OwnedBy.get(props.entity)?.value : from;

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

    return <FleetCard entity={props.entity} />;
  }, [isFleet, props.entity, props.unitCounts, from]);

  useEffect(() => {
    if (props.entity === "newFleet" || !components.IsFleet.get(props.entity)?.value) return;

    hydrateFleetData(props.entity, mud);
  }, [props.entity, mud]);

  return (
    <Card
      noDecor
      className={`w-full h-full relative`}
      // onMouseOver={props.onMouseOver}
      // onMouseLeave={props.onMouseLeave}
    >
      <div className="grid grid-rows-[10rem_1fr_1.5fr] gap-2 h-full">
        <div className="relative text-sm w-full flex justify-center font-bold gap-1">
          {Header}
          <Button className="absolute z-20 top-1 right-1" size="sm" variant="ghost" onClick={() => setTo(undefined)}>
            <FaTimes className="text-error w-3 h-3" />
          </Button>
        </div>

        {/*Units*/}
        <SecondaryCard className="grid grid-cols-4 grid-rows-2 gap-1">
          {Array(8)
            .fill(0)
            .map((_, index) => {
              if (index >= props.unitCounts.size)
                return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
              const [unit, count] = [...props.unitCounts.entries()][index];
              const delta = deltas?.get(unit) ?? 0n;
              return (
                <ResourceIcon
                  key={`to-unit-${unit}`}
                  resource={unit as Entity}
                  count={count}
                  delta={delta}
                  onClear={() => setDelta(unit, 0n)}
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
              return (
                <ResourceIcon
                  key={`to-resource-${entity}`}
                  className="bg-neutral/50"
                  resource={entity as Entity}
                  delta={delta}
                  count={count}
                  onClear={() => setDelta(entity, 0n)}
                />
              );
            })}
        </SecondaryCard>
      </div>
    </Card>
  );
};
