import { Entity } from "@latticexyz/recs";
import { EResource, MUDEnums } from "contracts/config/enums";
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

const fullResourceValue: Map<
  Entity,
  {
    time: bigint;
    resources: Map<Entity, ResourceCountData>;
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
  const resources = new Map<Entity, MotherlodeCountData>();

  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  const resourceEntity = ResourceEntityLookup[resource];
  const consumedResource = comps.P_ConsumesResource.getWithKeys({ resource })?.value as EResource;
  if (!consumedResource) throw new Error("Motherlode does not consume a resource");

  const lastClaimed = comps.LastClaimedAt.getWithKeys({ entity: entity as Hex })?.value ?? 0n;
  const time = comps.Time.get()?.value ?? 0n;
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
  fullResourceValue.set(entity, { time, resources });
  return resources;
}

export function getFullResourceCounts(rawSpaceRockEntity?: Entity) {
  const player = comps.OwnedBy.getWithKeys({ entity: rawSpaceRockEntity as Hex })?.value ?? comps.Account.get()?.value;
  const home = comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Entity | undefined;

  const spaceRockEntity = rawSpaceRockEntity ?? home;
  if (!spaceRockEntity) throw new Error("No space rock entity found");
  const time = comps.Time.get()?.value ?? 0n;

  const memo = fullResourceValue.get(spaceRockEntity);
  if (memo && memo?.time == time) {
    return memo.resources;
  }

  const consumptionTimeLengths: Record<number, bigint> = {};
  const result: Map<Entity, ResourceCountData> = new Map();

  // get and save the resource counts for the motherlodes
  const motherlodeResources = getMotherlodeResourceCounts(player as Entity);
  if (!home || spaceRockEntity !== home) return fullResourceValue.get(spaceRockEntity)?.resources ?? result;

  const homeHex = home as Hex;

  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: homeHex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

  MUDEnums.EResource.forEach((_: string, index: number) => {
    const entity = ResourceEntityLookup[index as EResource];
    if (entity == undefined) return;
    const resource = index as EResource;

    const motherlodeResource = motherlodeResources[entity] ?? {
      resourceCount: 0n,
      resourceStorage: 0n,
      production: 0n,
    };

    const resourceStorage = comps.MaxResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

    const resourceCount =
      motherlodeResource.minedAmount + (comps.ResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n);

    //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
    let productionRate =
      motherlodeResource.production + (comps.ProductionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n);

    const consumptionRate = comps.ConsumptionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

    //if they are both equal no change will be made
    if (productionRate == 0n && consumptionRate == 0n)
      return result.set(entity, {
        resourceCount,
        resourceStorage,
        production: 0n,
      });

    //first we calculate production
    let increase = 0n;
    if (productionRate > 0n) {
      //check to see if this resource consumes another resource to be produced
      const consumedResource = (comps.P_ConsumesResource.getWithKeys({ resource })?.value ?? 0) as EResource;

      //check if this resource consumes another resource, but the consumed resource isn't currently consumed by the space rock
      const consumedTime = consumptionTimeLengths[consumedResource] ?? 0n;

      //if this resource consumes another resource the maxium time it can be produced is the maximum time that the required resource is consumed
      const producedTime = consumedResource ? consumedTime : timeSinceClaimed;

      //the amount of resource that has been produced
      increase = productionRate * producedTime;

      //if the condumption time for the required resource is less than the time passed than currently production is 0
      if (producedTime < timeSinceClaimed) productionRate = 0n;
    }

    // the maximum amount of resourecs that will decrease if there is enough of the resource available decrease < resourceCount + increase
    let decrease = consumptionRate * timeSinceClaimed;

    //the maximum amount of time from the last update to this current time is the maximum amount of time this resource could have been consumed
    consumptionTimeLengths[resource] = timeSinceClaimed;

    //if increase and decrease match than nothing to update
    if (increase == decrease)
      return result.set(entity, {
        resourceCount,
        resourceStorage,
        production: 0n,
      });

    if (decrease - increase > resourceCount) {
      //if the decrease is more than the sum of increase and current amount then the sum is the maximum that can be consumed
      // we use this amount to see how much time the resource can be consumed
      consumptionTimeLengths[resource] = consumptionRate !== 0n ? (resourceCount + increase) / consumptionRate : 0n;
      //we use the time length to reduce current resource amount by the difference of the decrease and the increase
      decrease = consumptionRate * consumptionTimeLengths[resource];
      //consumption is from current space rock and will be in the future
      //consumptionRate = 0n;
    }

    let finalResourceCount = resourceCount + increase - decrease;
    finalResourceCount = clampBigInt(finalResourceCount, 0n, resourceStorage);

    const production =
      finalResourceCount < resourceStorage && finalResourceCount > 0 ? productionRate - consumptionRate : 0n;

    return result.set(entity, {
      resourceCount: finalResourceCount,
      resourceStorage,
      production,
    });
  });

  fullResourceValue.set(spaceRockEntity, {
    time,
    resources: result,
  });
  return result;
}
