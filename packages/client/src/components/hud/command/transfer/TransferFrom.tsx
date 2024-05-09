import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { useInCooldownEnd } from "src/hooks/useCooldownEnd";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { formatTime, parseResourceCount } from "src/util/number";
import { getUnitStats } from "src/util/unit";
import { ResourceIcon } from "./ResourceIcon";
import { hydrateFleetData } from "src/network/sync/indexer";
import { TransferSelect } from "@/components/hud/command/transfer/TransferSelect";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { Card, GlassCard, SecondaryCard } from "@/components/core/Card";
import { AsteroidCard } from "@/components/hud/command/AsteroidCard";
import { FleetCard } from "@/components/hud/command/FleetCard";

export const TransferFrom = (props: { unitCounts: Map<Entity, bigint>; resourceCounts: Map<Entity, bigint> }) => {
  const { from, setFrom } = useTransfer();

  return (
    <GlassCard className={`w-full h-full`}>
      <TransferSelect handleSelect={setFrom} hideNotOwned placement="top-right" />
      {!from && (
        <Card noDecor className="w-full h-full">
          <p className="h-full w-full grid place-items-center opacity-80 text-xs">Select a fleet or asteroid</p>
        </Card>
      )}
      {!!from && <_TransferFrom entity={from} unitCounts={props.unitCounts} resourceCounts={props.resourceCounts} />}
    </GlassCard>
  );
};

const _TransferFrom = ({
  entity,
  unitCounts,
  resourceCounts,
}: {
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { setDragging, deltas } = useTransfer();

  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const [keyDown, setKeyDown] = useState("");
  const { inCooldown, duration } = useInCooldownEnd(entity);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setKeyDown("shift");
    } else if (e.key === "Alt") {
      setKeyDown("alt");
    } else {
      setKeyDown(e.key);
    }
  }, []);
  const handleKeyUp = useCallback(() => setKeyDown(""), []);

  const isOwnedByPlayer = useMemo(() => {
    const isFleet = !!components.IsFleet.get(entity)?.value;

    let owner;
    if (isFleet) {
      const spacerock = (components.OwnedBy.get(entity)?.value ?? singletonEntity) as Entity;
      owner = components.OwnedBy.get(spacerock)?.value;
    } else {
      owner = components.OwnedBy.get(entity)?.value;
    }

    return owner === playerEntity;
  }, [entity, playerEntity]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleKeyUp]);

  const isFleet = components.IsFleet.get(entity)?.value;
  const Header = useMemo(() => {
    if (!isFleet) {
      return <AsteroidCard entity={entity} />;
    }
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    const ownerRock = components.OwnedBy.get(entity)?.value;
    unitCounts.forEach((count, unit) => {
      if (count === 0n) return;
      const unitData = getUnitStats(unit as Entity, ownerRock as Entity);
      data.attack += unitData.ATK * count;
      data.defense += unitData.CTR * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CGO * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });

    return <FleetCard entity={entity} />;
  }, [isFleet, entity, unitCounts]);

  useEffect(() => {
    if (!components.IsFleet.get(entity)?.value) return;

    hydrateFleetData(entity, mud);
  }, [entity, mud]);
  const sameOwner = false;

  return (
    <Card noDecor className="w-full h-full">
      <div className="grid grid-rows-[10rem_1fr_1.5fr] gap-2 h-full">
        <div className="relative text-sm w-full flex justify-center font-bold gap-1">{Header}</div>

        {/*Units*/}
        <SecondaryCard className="grid grid-cols-4 grid-rows-2 gap-1">
          {Array(8)
            .fill(0)
            .map((_, index) => {
              if (index >= unitCounts.size)
                return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
              const [unit, count] = [...unitCounts.entries()][index];
              const delta = deltas.get(unit);
              return (
                <ResourceIcon
                  key={`from-unit-${unit}`}
                  disabled={unit === EntityType.ColonyShip && !sameOwner}
                  resource={unit as Entity}
                  count={count}
                  delta={delta ? 0n - delta : undefined}
                  setDragging={() =>
                    setDragging({
                      entity: unit,
                      count: keyDown == "shift" ? count : keyDown == "alt" ? count / 2n : 1n,
                    })
                  }
                />
              );
            })}
          {unitCounts.size == 0 && (
            <div className="flex-1 absolute w-full h-full p-4 grid place-items-center">
              <p className="uppercase font-bold text-xs opacity-80">No units</p>
            </div>
          )}
        </SecondaryCard>

        {/*Resources*/}
        <SecondaryCard className="grid grid-cols-4 grid-rows-3 gap-1">
          {Array(10)
            .fill(0)
            .map((_, index) => {
              if (index >= resourceCounts.size)
                return <div key={`resource-blank-${index}`} className=" w-full h-full bg-white/10 opacity-50 " />;
              const [entity, count] = [...resourceCounts.entries()][index];
              const delta = deltas?.get(entity);
              return (
                <ResourceIcon
                  key={`to-resource-${entity}`}
                  resource={entity as Entity}
                  delta={delta ? 0n - delta : undefined}
                  count={count}
                  setDragging={() =>
                    setDragging({
                      entity,
                      count:
                        keyDown == "shift" ? count : keyDown == "alt" ? count / 2n : parseResourceCount(entity, "1"),
                    })
                  }
                />
              );
            })}
          {resourceCounts.size == 0 && (
            <div className="flex-1 absolute w-full h-full p-4 grid place-items-center">
              <p className="uppercase font-bold text-xs opacity-80">No resources</p>
            </div>
          )}
        </SecondaryCard>

        {!isOwnedByPlayer && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/75 z-10 pointer-events-auto text-error uppercase">
            <p>NOT OWNED BY YOU</p>
          </div>
        )}
        {inCooldown && isOwnedByPlayer && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/75 z-10 pointer-events-auto text-error uppercase">
            <p className="font-bold">In Cooldown</p>
            <p>{formatTime(duration)}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
