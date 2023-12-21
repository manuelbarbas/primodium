import { Entity } from "@latticexyz/recs";
import { EResource, ERock, MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { clampBigInt } from "./common";
import {
  EntityType,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  SPEED_SCALE,
  UnitEnumLookup,
} from "./constants";

export const getScale = (resource: Entity) => {
  if (
    UnitEnumLookup[resource] !== undefined ||
    resource === EntityType.FleetMoves ||
    resource === EntityType.VesselCapacity ||
    resource === EntityType.Defense ||
    resource === EntityType.MaxOrders
  )
    return 1n;
  return RESOURCE_SCALE;
};

export function getMotherlodeResource(entity: Entity) {
  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  if (!resource || resource > MUDEnums.EResource.length) return MUDEnums.EResource[0] as Entity;
  return ResourceEntityLookup[resource];
}

export type ResourceCountData = {
  resourceCount: bigint;
  resourceStorage: bigint;
  production: bigint;
};

type MotherlodeCountData = ResourceCountData & { minedAmount: bigint };

export function isUtility(resource: Entity) {
  const id = ResourceEnumLookup[resource];
  return comps.P_IsUtility.getWithKeys({ id })?.value ?? false;
}

const asteroidResources: Map<
  Entity,
  {
    time: bigint;
    resources: Map<Entity, ResourceCountData>;
  }
> = new Map();

const motherlodeResources: Map<
  Entity,
  {
    time: bigint;
    resources: Map<Entity, MotherlodeCountData>;
  }
> = new Map();

export function getFullResourceCount(resource: Entity, spaceRock?: Entity) {
  return (
    getFullResourceCounts(spaceRock).get(resource) ?? {
      resourceCount: 0n,
      resourceStorage: 0n,
      production: 0n,
    }
  );
}

// This function exists temporarly as mined motherlode resources are claimed to hom asteroid directly
// in the future we never have to resolve or take into account mutliple space rock resources as they have to manualy transported between space rocks
export function getMotherlodeResourceCounts(playerEntity: Entity): Record<Entity, MotherlodeCountData> {
  const ownedMotherlodes = comps.OwnedMotherlodes.getWithKeys({ entity: playerEntity as Hex })?.value ?? [];
  const motherlodeResources = ownedMotherlodes.map((motherlode) => getMotherlodeResourceCount(motherlode as Entity));

  const combinedCounts: Record<Entity, MotherlodeCountData> = {};

  // Function to sum resource counts
  const sumResourceCounts = (resourceCounts: Map<Entity, MotherlodeCountData>) => {
    [...resourceCounts.entries()].forEach(([rawKey, value]) => {
      const key = rawKey as Entity;
      if (!combinedCounts[key]) {
        combinedCounts[key] = {
          resourceCount: 0n,
          resourceStorage: 0n,
          production: 0n,
          minedAmount: 0n,
        };
      }
      combinedCounts[key].resourceCount += value.resourceCount;
      combinedCounts[key].resourceStorage += value.resourceStorage;
      combinedCounts[key].production += value.production;
      combinedCounts[key].minedAmount += value.minedAmount;
    });
  };

  // Sum each motherlode's resource counts
  motherlodeResources.forEach((motherlodeResource) => {
    sumResourceCounts(motherlodeResource);
  });

  return combinedCounts;
}

export function getMotherlodeResourceCount(entity: Entity): Map<Entity, MotherlodeCountData> {
  const time = comps.Time.get()?.value ?? 0n;
  const memo = motherlodeResources.get(entity);
  if (memo && memo?.time == time) {
    return memo.resources;
  }

  const resources = new Map<Entity, MotherlodeCountData>();

  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  const resourceEntity = ResourceEntityLookup[resource];
  const consumedResource = comps.P_ConsumesResource.getWithKeys({ resource })?.value as EResource;
  if (!consumedResource) throw new Error("Motherlode does not consume a resource");

  const lastClaimed = comps.LastClaimedAt.getWithKeys({ entity: entity as Hex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - lastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

  const productionRate = comps.ProductionRate.getWithKeys({ entity: entity as Hex, resource })?.value ?? 0n;
  const maxResourceCount =
    comps.MaxResourceCount.getWithKeys({ entity: entity as Hex, resource: consumedResource })?.value ?? 0n;
  const resourceCount =
    comps.ResourceCount.getWithKeys({ entity: entity as Hex, resource: consumedResource })?.value ?? 0n;

  let minedAmount = productionRate * timeSinceClaimed;
  if (minedAmount > resourceCount) {
    minedAmount = resourceCount;
  }
  const resourceCountLeft = resourceCount - minedAmount;

  //set the value of the produced resource. The client shouldn't know about raw resources
  resources.set(resourceEntity, {
    resourceCount: resourceCountLeft,
    resourceStorage: maxResourceCount,
    production: resourceCountLeft == 0n ? 0n : -productionRate,
    minedAmount,
  });

  //memoize
  motherlodeResources.set(entity, { time, resources });
  return resources;
}

export function getAsteroidResourceCount(asteroid: Entity) {
  const player = comps.OwnedBy.getWithKeys({ entity: asteroid as Hex })?.value;
  const home = player ? (comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Entity) : undefined;
  const isHome = home === asteroid;
  const time = comps.Time.get()?.value ?? 0n;
  // Calculate all resources counts for the player's motherlodes and home asteroid and memoize

  const motherlodeResourceCounts = isHome ? getMotherlodeResourceCounts(player as Entity) : {};

  const consumptionTimeLengths: Record<number, bigint> = {};
  const result: Map<Entity, ResourceCountData> = new Map();

  const homeHex = asteroid as Hex;

  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: homeHex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

  MUDEnums.EResource.forEach((_: string, index: number) => {
    const entity = ResourceEntityLookup[index as EResource];
    if (entity == undefined) return;
    const resource = index as EResource;

    const motherlodeResource =
      motherlodeResourceCounts[entity] ??
      ({
        resourceCount: 0n,
        resourceStorage: 0n,
        production: 0n,
        minedAmount: 0n,
      } satisfies MotherlodeCountData);

    const resourceStorage = comps.MaxResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

    const resourceCount =
      motherlodeResource.minedAmount + (comps.ResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n);

    // motherlode production is negative
    let productionRate =
      -motherlodeResource.production + (comps.ProductionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n);

    const consumptionRate = comps.ConsumptionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

    if (productionRate == 0n && consumptionRate == 0n)
      return result.set(entity, {
        resourceCount,
        resourceStorage,
        production: 0n,
      });

    let increase = 0n;
    //first we calculate production
    if (productionRate > 0n) {
      const consumedResource = (comps.P_ConsumesResource.getWithKeys({ resource })?.value ?? 0) as EResource;

      //check if the consumed resource isn't consumed by the space rock
      const consumedTime = consumptionTimeLengths[consumedResource] ?? 0n;

      //maximum production time is required resource consumption
      const producedTime = consumedResource ? consumedTime : timeSinceClaimed;

      //the amount of resource that has been produced
      increase = productionRate * producedTime;

      //if consumption is less than time passed then production is 0
      if (producedTime < timeSinceClaimed) productionRate = 0n;
    }

    // max resource decrease (if there is enough resource) is decrease < resourceCount + increase
    let decrease = consumptionRate * timeSinceClaimed;

    //max time from the last update to now is max time this resource was consumed
    consumptionTimeLengths[resource] = timeSinceClaimed;

    if (increase == decrease)
      return result.set(entity, {
        resourceCount,
        resourceStorage,
        production: 0n,
      });

    if (decrease - increase > resourceCount) {
      // if the decrease is more than the sum of increase and current amount then the sum is the maximum that can be consumed
      // we use this amount to see how much time the resource can be consumed
      consumptionTimeLengths[resource] = consumptionRate !== 0n ? (resourceCount + increase) / consumptionRate : 0n;
      // we use the time length to reduce current resource amount by the difference of the decrease and the increase
      decrease = consumptionRate * consumptionTimeLengths[resource];
      // consumption is from current space rock and will be in the future
      // consumptionRate = 0n;
    }

    const finalResourceCount = clampBigInt(resourceCount + increase - decrease, 0n, resourceStorage);

    const production =
      finalResourceCount < resourceStorage && finalResourceCount > 0 ? productionRate - consumptionRate : 0n;

    return result.set(entity, {
      resourceCount: finalResourceCount,
      resourceStorage,
      production,
    });
  });

  asteroidResources.set(asteroid, {
    time,
    resources: result,
  });
  return result;
}

export function getFullResourceCounts(rawSpaceRockEntity?: Entity): Map<Entity, ResourceCountData> {
  const player = comps.Account.get()?.value as Entity;
  const spaceRockEntity = rawSpaceRockEntity ?? (comps.Home.get(player)?.asteroid as Entity);
  if (!spaceRockEntity) throw new Error("No space rock entity");
  const rockType = comps.RockType.getWithKeys({ entity: spaceRockEntity as Hex })?.value;
  if (!rockType) throw new Error("Space rock does not have a rock type");
  // if the rock is a motherlode, calculate the motherlode resources and return the value
  return rockType === ERock.Motherlode
    ? getMotherlodeResourceCount(spaceRockEntity)
    : getAsteroidResourceCount(spaceRockEntity);
}
