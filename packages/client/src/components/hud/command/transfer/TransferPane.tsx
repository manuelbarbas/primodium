import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { EResource } from "contracts/config/enums";
import { useEffect, useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Hex } from "viem";

import {
  entityToFleetName,
  getEntityTypeName,
  parseResourceCount,
  ResourceEntityLookup,
  UnitStorages,
  UtilityStorages,
} from "@primodiumxyz/core";
import { useAccountClient, useCore, usePlayerOwner } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { Card, GlassCard, SecondaryCard } from "@/components/core/Card";
import { AsteroidCard } from "@/components/hud/command/AsteroidCard";
import { _FleetCard } from "@/components/hud/command/FleetCard";
import { TransferSelect } from "@/components/hud/command/transfer/TransferSelect";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { cn } from "@/util/client";

import { ResourceIcon } from "./ResourceIcon";

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
  const {
    left,
    right,
    setLeft,
    setRight,
    flashing,
    deltas,
    moving,
    setHovering,
    setMoving,
    hovering,
    errors,
    setError,
  } = useTransfer();

  const { tables, utils, sync } = useCore();
  const error = errors[props.side];
  const selectedRock = tables.SelectedRock.use()?.value;
  const newFleet = props.entity === "newFleet";
  const isFleet = newFleet || tables.IsFleet.has(props.entity as Entity);
  const ownerRock = (
    isFleet ? (!newFleet ? tables.OwnedBy.get(props.entity as Entity)?.value : selectedRock) : props.entity
  ) as Entity;
  const playerOwner = usePlayerOwner(newFleet ? undefined : (props.entity as Entity));
  const playerEntity = useAccountClient().playerAccount.entity;

  const Header = useMemo(() => {
    if (!isFleet && props.entity !== "newFleet") {
      return <AsteroidCard entity={props.entity} />;
    }
    const data = { title: "New Fleet", attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

    if (!ownerRock) return <></>;

    props.unitCounts.forEach((count, unit) => {
      const unitData = utils.getUnitStats(unit as Entity, ownerRock as Entity);
      data.attack += unitData.ATK * count;
      data.defense += unitData.CTR * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CGO * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });

    if (!newFleet) {
      data.title = entityToFleetName(props.entity as Entity);
    }

    return (
      <_FleetCard
        stats={data}
        home={ownerRock}
        hostile={props.entity !== "newFleet" && playerOwner !== playerEntity}
        destination={selectedRock}
        stance={newFleet ? "In Hangar" : "Orbiting"}
      />
    );
  }, [isFleet, props.entity, props.unitCounts, newFleet, left, selectedRock]);

  useEffect(() => {
    if (props.entity === "newFleet" || !tables.IsFleet.get(props.entity)?.value) return;

    sync.syncFleetData(props.entity);
  }, [props.entity]);

  const otherEntityOwnerRock = useMemo(() => {
    const otherEntity = props.side === "left" ? right : left;
    if (otherEntity === "newFleet") return undefined;
    const isFleet = tables.IsFleet.get(otherEntity)?.value;
    return isFleet ? tables.OwnedBy.get(otherEntity)?.value : otherEntity;
  }, [props.side, left, right]);

  const checkErrors = ({
    entity,
    asteroid,
    deltas,
    unitCounts,
    resourceCounts,
    invert,
    sameOwnerRock,
  }: {
    entity: Entity | "newFleet";
    asteroid: Entity | undefined;
    deltas: Map<Entity, bigint>;
    unitCounts: Map<Entity, bigint>;
    resourceCounts: Map<Entity, bigint>;
    invert?: boolean;
    sameOwnerRock?: boolean;
  }) => {
    if (!asteroid) return { disabled: true, submitMessage: "No asteroid selected" };
    const isFleet = entity === "newFleet" || tables.IsFleet.has(entity as Entity);
    if (entity === "newFleet" && unitCounts.size === 0) return { disabled: true, submitMessage: "No units" };
    if (isFleet) {
      const owner = (entity !== "newFleet" ? tables.OwnedBy.get(entity)?.value : undefined) as Entity | undefined;
      const capacity = utils.getFleetStatsFromUnits(unitCounts, owner).cargo;
      const cargo = [...resourceCounts.entries()].reduce((acc, [, count]) => acc + count, 0n);
      if (cargo > capacity) return { disabled: true, submitMessage: "Cargo capacity exceeded" };
      if (entity === "newFleet") return { disabled: false, submitMessage: "" };
    }

    // make sure we have enough storage for housing
    const utilitiesAdded = [...deltas.entries()].reduce(
      (acc, [unit, count]) => {
        if (!UnitStorages.has(unit)) return acc;
        const level = tables.UnitLevel.getWithKeys({ unit: unit as Hex, entity: entity as Hex })?.value ?? 0n;
        const requiredResources = tables.P_RequiredResources.getWithKeys({ prototype: unit as Hex, level });
        if (!requiredResources) return acc;
        requiredResources.resources.forEach((rawResource, i) => {
          const resource = ResourceEntityLookup[rawResource as EResource];
          if (!UtilityStorages.has(resource)) return;
          const amount = requiredResources.amounts[i] * (invert ? -count : count);
          acc[resource] ? (acc[resource] += amount) : (acc[resource] = amount);
        });
        return acc;
      },
      {} as Record<Entity, bigint>,
    );

    if (!sameOwnerRock) {
      const notEnoughUtilities = Object.entries(utilitiesAdded).reduce(
        (acc, [resource, count]) => {
          const { resourceCount } = utils.getResourceCount(resource as Entity, asteroid);
          if (count <= resourceCount) return acc;
          return [...acc, { entity: resource as Entity, resourceCount, count }];
        },
        [] as { entity: Entity; resourceCount: bigint; count: bigint }[],
      );

      if (notEnoughUtilities.length > 0)
        return {
          disabled: true,
          submitMessage: `Not enough ${getEntityTypeName(notEnoughUtilities[0].entity)} (-${
            notEnoughUtilities[0].count
          })`,
        };
    }
    if (!isFleet) {
      // make sure we have enough storage for resources
      const notEnoughResources = [...resourceCounts.entries()].reduce(
        (acc, [resource, count]) => {
          const { resourceStorage } = utils.getResourceCount(resource as Entity, asteroid);
          if (count <= resourceStorage) return acc;
          return [...acc, { entity: resource as Entity, resourceStorage, count }];
        },
        [] as { entity: Entity; resourceStorage: bigint; count: bigint }[],
      );

      if (notEnoughResources.length > 0) {
        return {
          disabled: true,
          submitMessage: `Not enough ${getEntityTypeName(notEnoughResources[0].entity as Entity)} storage`,
        };
      }
    }
    return { disabled: false, submitMessage: "" };
  };

  useEffect(() => {
    const { disabled, submitMessage } = checkErrors({
      entity: props.entity,
      asteroid: ownerRock as Entity | undefined,
      deltas,
      unitCounts: props.unitCounts,
      resourceCounts: props.resourceCounts,
      invert: props.side === "left",
      sameOwnerRock: ownerRock === otherEntityOwnerRock,
    });
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
  const onSelect = (entity: Entity, count: bigint) => {
    if (moving !== null) return;
    if (count === 0n) return;
    setMoving({ side: props.side, entity, count });
  };

  console.log("THE FUCKING left ", props);
  // console.log("THE FUCKING right ", right);
  return (
    <Card noDecor className={cn("w-full h-full relative")}>
      <div
        className={cn(
          "grid grid-rows-[10rem_1fr] gap-2 h-full overflow-y-auto scrollbar",
          hovering === props.side ? "ring ring-1 ring-accent" : "",
          flashing === props.side ? "ring ring-1 ring-error" : "",
        )}
        onMouseLeave={() => setHovering(null)}
        onMouseOver={onMouseOver}
      >
        <div className="relative text-sm w-full flex justify-center font-bold gap-1">{Header}</div>

        <TransactionQueueMask
          queueItemId={"TRANSFER" as Entity}
          className="grid grid-rows-[1fr_1.5fr] gap-2 w-full h-full relative"
        >
          {(!left || !right) && (
            <div className="absolute top-0 left-0 w-full h-full grid place-items-center text-center text-warning bg-black/70 z-20">
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
                  const isPlayerOwner = playerOwner === playerEntity;
                  const maxToMove = isPlayerOwner ? count : delta;

                  const countMoved = aux ? parseResourceCount(unit, "1") : maxToMove;
                  onSelect(unit, countMoved);
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
                  const isPlayerOwner = playerOwner === playerEntity;
                  const maxToMove = isPlayerOwner ? count : delta;

                  const countMoved = aux ? parseResourceCount(entity, "1") : maxToMove;
                  onSelect(entity, countMoved);
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
        {left && right && (
          <div className="w-full flex justify-center gap-1">
            <Button
              size="sm"
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
        )}
      </div>
    </Card>
  );
};
