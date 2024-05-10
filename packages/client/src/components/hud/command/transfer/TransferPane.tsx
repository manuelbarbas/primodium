import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo } from "react";
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
import { Button } from "@/components/core/Button";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { getFullResourceCount } from "@/util/resource";
import { ResourceEntityLookup, UtilityStorages } from "@/util/constants";
import { EResource } from "contracts/config/enums";
import { getEntityTypeName } from "src/util/common";
import { getFleetStatsFromUnits } from "src/util/unit";
import { Hex } from "viem";

export const TransferPane = (props: {
  selectPlacement?: "top-right" | "top-left";
  type: "left" | "right";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { right, setRight, left, setLeft } = useTransfer();
  const entity = props.type === "right" ? right : left;

  return (
    <GlassCard className={`w-full h-full`}>
      {!entity && (
        <TransferSelect
          handleSelect={props.type === "left" ? setLeft : setRight}
          showNewFleet={props.type === "right"}
          hideNotOwned={props.type === "left"}
        />
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
  type: "left" | "right";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { left, right, setLeft, setRight, deltas, moving, setHovering, setMoving, hovering } = useTransfer();
  const selectedRock = components.SelectedRock.use()?.value;
  const mud = useMud();
  const newFleet = props.entity === "newFleet";
  const isFleet = newFleet || components.IsFleet.has(props.entity as Entity);
  const Header = useMemo(() => {
    if (!isFleet && props.entity !== "newFleet") {
      return <AsteroidCard entity={props.entity} />;
    }
    const data = { title: "New Fleet", attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    const ownerRock = !newFleet ? components.OwnedBy.get(props.entity as Entity)?.value : selectedRock;

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
  }, [isFleet, props.entity, props.unitCounts, newFleet, left, selectedRock]);

  useEffect(() => {
    if (props.entity === "newFleet" || !components.IsFleet.get(props.entity)?.value) return;

    hydrateFleetData(props.entity, mud);
  }, [props.entity, mud]);

  const onMouseOver = () => {
    if (!moving) return;
    if (props.type === "left") {
      setHovering("left");
    } else {
      setHovering("right");
    }
  };
  return (
    <Card noDecor className={cn("w-full h-full relative", hovering === props.type ? "ring ring-secondary" : "")}>
      <div
        className="grid grid-rows-[10rem_1fr] gap-2 h-full"
        onMouseLeave={() => setHovering(null)}
        onMouseOver={onMouseOver}
      >
        <div className="relative text-sm w-full flex justify-center font-bold gap-1">{Header}</div>

        <TransactionQueueMask
          queueItemId={"TRANSFER" as Entity}
          className="grid grid-rows-[1fr_1.5fr] gap-2 w-full h-full relative"
        >
          {(!left || !right) && (
            <div className="absolute top-0 left-0 w-full h-full grid place-items-center text-center text-warning bg-black/70 z-30">
              <p className="w-3/4">Select a fleet or asteroid to trade with</p>
            </div>
          )}
          <SecondaryCard className="grid grid-cols-4 grid-rows-2 gap-1">
            {/*Units*/}
            {Array(8)
              .fill(0)
              .map((_, index) => {
                if (index >= props.unitCounts.size)
                  return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-left-${index}`} />;
                const [unit, count] = [...props.unitCounts.entries()][index];
                const delta = deltas?.get(unit) ?? 0n;
                const onClick = (aux?: boolean) => {
                  const countMoved = aux ? 1n : count;
                  setMoving({
                    side: props.type,
                    entity: unit,
                    count: countMoved,
                  });
                };
                return (
                  <ResourceIcon
                    key={`right-unit-${unit}`}
                    onClick={onClick}
                    size="sm"
                    resource={unit as Entity}
                    count={count}
                    rawDelta={delta}
                    negative={props.type === "right"}
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
                    side: props.type,
                    entity: entity,
                    count: countMoved,
                  });
                };
                return (
                  <ResourceIcon
                    onClick={onClick}
                    key={`right-resource-${entity}`}
                    size="sm"
                    className="bg-neutral/50"
                    resource={entity as Entity}
                    rawDelta={delta}
                    count={count}
                    negative={props.type === "right"}
                  />
                );
              })}
          </SecondaryCard>
        </TransactionQueueMask>
        <Button
          onClick={() => {
            if (props.type === "left") {
              setLeft(undefined);
            } else {
              setRight(undefined);
            }
          }}
        >
          back
        </Button>
      </div>
    </Card>
  );
};

const checkErrors = (
  entity: Entity | "newFleet",
  unitCounts: Map<Entity, bigint>,
  resourceCounts: Map<Entity, bigint>
) => {
  const isFleet = entity === "newFleet" || components.IsFleet.has(entity as Entity);
  if (isFleet) {
    const owner = (entity !== "newFleet" ? components.OwnedBy.get(entity)?.value : undefined) as Entity | undefined;
    const cargo = getFleetStatsFromUnits(unitCounts, owner).cargo;
    if (cargo < [...resourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n))
      return { disabled: true, submitMessage: "Sender cargo capacity exceeded" };
    return { disabled: false, submitMessage: "Transfer" };
  }
  //ASTEROID
  // make sure we have enough storage for housing
  const utilitiesUsed = [...unitCounts.entries()].reduce((acc, [unit, count]) => {
    const level = components.UnitLevel.getWithKeys({ unit: unit as Hex, entity: entity as Hex })?.value ?? 0n;
    const requiredResources = components.P_RequiredResources.getWithKeys({ prototype: unit as Hex, level });
    if (!requiredResources) return acc;
    requiredResources.resources.forEach((rawResource, i) => {
      const resource = ResourceEntityLookup[rawResource as EResource];
      if (!UtilityStorages.has(resource)) return;
      const amount = requiredResources.amounts[i] * count;
      acc[resource] ? (acc[resource] += amount) : (acc[resource] = amount);
    });
    return acc;
  }, {} as Record<Entity, bigint>);

  const enoughUtilities = Object.entries(utilitiesUsed).find(([resource, count]) => {
    const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
    return count > resourceStorage;
  });

  if (enoughUtilities)
    return { disabled: true, submitMessage: `Not enough ${getEntityTypeName(enoughUtilities[0] as Entity)} storage` };

  // make sure we have enough storage for resources
  const enoughResources = [...resourceCounts.entries()].find(([resource, count]) => {
    const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
    return count > resourceStorage;
  });
  if (enoughResources)
    return { disabled: true, submitMessage: `Not enough ${getEntityTypeName(enoughResources[0] as Entity)} storage` };
  return { disabled: false, submitMessage: "Transfer" };
};

checkErrors;
