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
import { FaExclamationTriangle } from "react-icons/fa";

export const TransferPane = (props: {
  side: "left" | "right";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { right, left } = useTransfer();
  const entity = props.side === "right" ? right : left;

  return (
    <GlassCard className={`w-full h-full overflow-hidden`}>
      {!entity && <TransferSelect side={props.side} />}
      {!!entity && (
        <_TransferPane
          entity={entity}
          side={props.side}
          unitCounts={props.unitCounts}
          resourceCounts={props.resourceCounts}
        />
      )}
    </GlassCard>
  );
};

export const _TransferPane = (props: {
  entity: Entity | "newFleet";
  side: "left" | "right";
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
}) => {
  const { left, right, setLeft, setRight, deltas, moving, setHovering, setMoving, hovering, errors, setError } =
    useTransfer();

  const error = errors[props.side];
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

  useEffect(() => {
    const { disabled, submitMessage } = checkErrors(props.entity, props.unitCounts, props.resourceCounts);
    setError(props.side, disabled ? submitMessage : null);
  }, [props.resourceCounts, props.unitCounts, props.entity]);

  const onMouseOver = () => {
    if (!moving) return;
    if (props.side === "left") {
      setHovering("left");
    } else {
      setHovering("right");
    }
  };
  return (
    <Card noDecor className={cn("w-full h-full relative", hovering === props.side ? "ring ring-secondary" : "")}>
      <div
        className="grid grid-rows-[10rem_1fr] gap-2 h-full overflow-y-auto scrollbar"
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
                    side: props.side,
                    entity: unit,
                    count: countMoved,
                  });
                };
                return (
                  <ResourceIcon
                    key={`right-unit-${unit}`}
                    onClick={onClick}
                    size="sm"
                    disabled={moving !== null}
                    resource={unit as Entity}
                    count={count}
                    rawDelta={delta}
                    negative={props.side === "right"}
                  />
                );
              })}
          </SecondaryCard>

          {/*Resources*/}

          <SecondaryCard className="relative grid grid-cols-4 grid-rows-3 gap-1">
            {Array(10)
              .fill(0)
              .map((_, index) => {
                if (index >= props.resourceCounts.size)
                  return <div key={`resource-blank-${index}`} className=" w-full h-full bg-white/10 opacity-50 " />;
                const [entity, count] = [...props.resourceCounts.entries()][index];
                const delta = deltas?.get(entity) ?? 0n;
                const onClick = (aux?: boolean) => {
                  console.log({ moving });
                  if (moving !== null) return;
                  const countMoved = aux ? parseResourceCount(entity, "1") : count;
                  setMoving({
                    side: props.side,
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
                    disabled={moving !== null}
                    resource={entity as Entity}
                    rawDelta={delta}
                    count={count}
                    negative={props.side === "right"}
                  />
                );
              })}
            {error && (
              <div className="col-span-2 bg-error flex p-4 justify-center text-center items-center text-xs">
                <FaExclamationTriangle className="w-6 mr-1" />
                {error}
              </div>
            )}
          </SecondaryCard>
        </TransactionQueueMask>
        <Button
          onClick={() => {
            if (props.side === "left") {
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
    if (unitCounts.size === 0) return { disabled: true, submitMessage: "No units on board" };
    const owner = (entity !== "newFleet" ? components.OwnedBy.get(entity)?.value : undefined) as Entity | undefined;
    const capacity = getFleetStatsFromUnits(unitCounts, owner).cargo;
    const cargo = [...resourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n);
    if (cargo > capacity) return { disabled: true, submitMessage: "Cargo capacity exceeded" };
    return { disabled: false, submitMessage: "" };
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
  return { disabled: false, submitMessage: "" };
};
