import { Entity } from "@latticexyz/recs";
import { EResource, MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import {
  EntityType,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  ResourceType,
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

// building a building requires resources
// fetch directly from component data
export function getRecipe(rawEntityType: Entity, level: bigint, upgrade = false) {
  const entityType = rawEntityType as Hex;
  const requiredResources = (upgrade ? comps.P_RequiredUpgradeResources : comps.P_RequiredResources).getWithKeys(
    { prototype: entityType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );
  const requiredProduction = comps.P_RequiredDependency.getWithKeys({ prototype: entityType, level: level }, undefined);

  const resources = requiredResources.resources.map((resource: EResource, index: number) => ({
    id: ResourceEntityLookup[resource],
    type: comps.P_IsUtility.getWithKeys({ id: resource })?.value == true ? ResourceType.Utility : ResourceType.Resource,
    amount: requiredResources.amounts[index],
  }));

  const resourceRate = requiredProduction
    ? [
        {
          id: ResourceEntityLookup[requiredProduction.resource as EResource],
          type: ResourceType.ResourceRate,
          amount: requiredProduction.amount,
        },
      ]
    : [];

  return [...resources, ...resourceRate];
}

export function getMotherlodeResource(entity: Entity) {
  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  if (!resource || resource > MUDEnums.EResource.length) return MUDEnums.EResource[0] as Entity;
  return ResourceEntityLookup[resource];
}

export function getPlayerFullResourceCount(resource: Entity, playerEntity: Entity) {
  const ownedMotherlodes = comps.OwnedMotherlodes.getWithKeys({ entity: playerEntity as Hex })?.value ?? [];
  const motherlodeResources = ownedMotherlodes.map((value) => getFullResourceCount(resource, value as Entity));
  const homeAsteroid = comps.Home.get(playerEntity)?.asteroid as Entity | undefined;
  const homeResources = getFullResourceCount(resource, homeAsteroid);

  return [...motherlodeResources, homeResources].reduce(
    (prev, curr) => ({
      resourceCount: prev.resourceCount + curr.resourceCount,
      resourcesToClaim: prev.resourcesToClaim + curr.resourcesToClaim,
      resourceStorage: prev.resourceStorage + curr.resourceStorage,
      production: prev.production + curr.production,
      producedResource: prev.producedResource + curr.producedResource,
    }),
    {
      resourceCount: 0n,
      resourcesToClaim: 0n,
      resourceStorage: 0n,
      production: 0n,
      producedResource: 0n,
    }
  );
}
// This function exists temporarly as mined motherlode resources are claimed to hom asteroid directly
// in the future we never have to resolve or take into account mutliple space rock resources as they have to manualy transported between space rocks
export function getPlayerFullResourceCounts(playerEntity: Entity) {
  const ownedMotherlodes = comps.OwnedMotherlodes.getWithKeys({ entity: playerEntity as Hex })?.value ?? [];
  const motherlodeResources = ownedMotherlodes.map((value) => getFullResourceCounts(value as Entity));
  const homeAsteroid = comps.Home.get(playerEntity)?.asteroid as Entity | undefined;
  const homeResources = getFullResourceCounts(homeAsteroid);

  const combinedCounts: Record<Entity, ResourceCountData> = {};

  // Function to sum resource counts
  const sumResourceCounts = (resourceCounts: Map<Entity, ResourceCountData>) => {
    [...resourceCounts.entries()].forEach(([rawKey, value]) => {
      const key = rawKey as Entity;
      if (!combinedCounts[key]) {
        combinedCounts[key] = {
          resourceCount: 0n,
          resourcesToClaim: 0n,
          resourceStorage: 0n,
          production: 0n,
          producedResource: 0n,
        };
      }
      combinedCounts[key].resourceCount += value.resourceCount;
      combinedCounts[key].resourcesToClaim += value.resourcesToClaim;
      combinedCounts[key].resourceStorage += value.resourceStorage;
      combinedCounts[key].production += value.production;
      combinedCounts[key].producedResource += value.producedResource;
    });
  };

  // Sum home resource counts
  sumResourceCounts(homeResources);

  // Sum each motherlode's resource counts
  motherlodeResources.forEach((motherlodeResource) => {
    sumResourceCounts(motherlodeResource);
  });

  return combinedCounts;
}

type ResourceCountData = {
  resourceCount: bigint;
  resourcesToClaim: bigint;
  resourceStorage: bigint;
  production: bigint;
  producedResource: bigint;
};

export function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, spaceRock?: Entity, count = 1n) {
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, spaceRock);
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production } = resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        if (resourceCount + resourcesToClaim < resource.amount * count) return false;
        break;
      case ResourceType.ResourceRate:
        if (production < resource.amount * count) return false;
        break;
      case ResourceType.Utility:
        if (resourceCount < resource.amount * count) return false;
        break;
      default:
        return false;
    }
  }

  return true;
}

export function getRecipeDifference(
  firstRecipe: ReturnType<typeof getRecipe>,
  secondRecipe: ReturnType<typeof getRecipe>
) {
  const difference = firstRecipe.map((resource) => {
    let amount = resource.amount;
    if (resource.type == ResourceType.Utility) {
      const secondResource = secondRecipe.find((secondResource) => resource.id === secondResource.id);

      if (secondResource) {
        amount = resource.amount - secondResource.amount;
      }
    }

    return {
      id: resource.id,
      amount: amount,
      type: resource.type,
    };
  });

  return difference;
}

export function getMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, spaceRock?: Entity) {
  spaceRock = spaceRock ?? (comps.Home.getWithKeys({ entity: comps.Account.get()?.value as Hex })?.asteroid as Entity);
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, spaceRock);
  });

  let count;
  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production } = resourceAmount;
    let maxOfResource = 0n;
    switch (resource.type) {
      case ResourceType.Resource:
        maxOfResource = (resourceCount + resourcesToClaim) / resource.amount;
        break;
      case ResourceType.ResourceRate:
        maxOfResource = production / resource.amount;
        break;
      case ResourceType.Utility:
        maxOfResource = resourceCount / resource.amount;
        break;
    }
    if (!count) count = Number(maxOfResource);
    else count = Math.min(count, Number(maxOfResource));
  }

  return count ?? 0;
}

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
      resourcesToClaim: 0n,
      resourceStorage: 0n,
      production: 0n,
      producedResource: 0n,
    }
  );
}

export function getFullResourceCounts(spaceRockEntity?: Entity) {
  spaceRockEntity =
    spaceRockEntity ?? (comps.Home.getWithKeys({ entity: comps.Account.get()?.value as Hex })?.asteroid as Entity);
  const time = comps.Time.get()?.value ?? 0n;
  const memo = fullResourceValue.get(spaceRockEntity);
  if (memo && memo?.time == time) {
    return memo.resources;
  }
  const consumptionTimeLengths: Record<number, bigint> = {};
  const result: Map<Entity, ResourceCountData> = new Map();

  const player = comps.OwnedBy.getWithKeys({ entity: spaceRockEntity as Hex })?.value ?? comps.Account.get()?.value;
  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: spaceRockEntity as Hex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;
  MUDEnums.EResource.forEach((_: string, index: number) => {
    const entity = ResourceEntityLookup[index as EResource];
    if (!entity || index == 0 || index > MUDEnums.EResource.length) return;
    const resource = index as EResource;

    let resourceCount = comps.ResourceCount.getWithKeys({ entity: spaceRockEntity as Hex, resource })?.value ?? 0n;

    let resourceStorage = comps.MaxResourceCount.getWithKeys({ entity: spaceRockEntity as Hex, resource })?.value ?? 0n;

    const producedResource = player
      ? comps.ProducedResource?.getWithKeys({ entity: player as Hex, resource })?.value ?? 0n
      : 0n;
    //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
    let productionRate = comps.ProductionRate.getWithKeys({ entity: spaceRockEntity as Hex, resource })?.value ?? 0n;
    let consumptionRate = comps.ConsumptionRate.getWithKeys({ entity: spaceRockEntity as Hex, resource })?.value ?? 0n;

    //if they are both equal no change will be made
    if (productionRate == 0n && consumptionRate == 0n)
      return result.set(entity, {
        resourceCount,
        resourcesToClaim: 0n,
        resourceStorage,
        production: 0n,
        producedResource,
      });

    //first we calculate production
    let increase = 0n;
    if (productionRate > 0n) {
      //check to see if this resource consumes another resource to be produced
      const consumedResource = (comps.P_ConsumesResource.getWithKeys({ resource })?.value ?? 0) as EResource;

      //if this resource consumes another resource the maxium time it can be produced is the maximum time that the required resource is consumed
      const producedTime = consumedResource ? consumptionTimeLengths[consumedResource] : timeSinceClaimed;

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
        resourceCount: resourceCount,
        resourcesToClaim: 0n,
        resourceStorage: resourceStorage,
        production: 0n,
        producedResource: producedResource,
      });

    if (resourceCount + increase < decrease) {
      //if the decrease is more than the sum of increase and current amount than the sum is tha maximum that can be consumed
      // we use this amount to see how much time the resource can be consumed
      consumptionTimeLengths[resource] = (resourceCount + increase) / consumptionRate;
      //we use the time length to reduce current resource amount by the difference of the decrease and the increase
      decrease = consumptionRate * consumptionTimeLengths[resource];
      //consumption is from current space rock and will be in the future
      consumptionRate = 0n;
    }

    const motherlode = comps.Motherlode.getWithKeys({ entity: spaceRockEntity as Hex });
    if (player && motherlode && motherlode.motherlodeType == index) {
      const home = comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Hex;
      if (!home) throw new Error("No home found");
      resourceStorage =
        comps.MaxResourceCount.getWithKeys({
          entity: home,
          resource,
        })?.value ?? 0n;
      resourceCount =
        comps.ResourceCount.getWithKeys({
          entity: home,
          resource,
        })?.value ?? 0n;
    }

    const finalResourceCount = resourceCount + increase - decrease;
    const resourcesToClaim =
      finalResourceCount > resourceStorage
        ? resourceStorage - resourceCount
        : finalResourceCount < 0n
        ? -resourceCount
        : increase - decrease;

    // if (index == EResource.Iron)
    // console.log(
    //   "increse:",
    //   increase,
    //   "decrease",
    //   decrease,
    //   "final count:",
    //   finalResourceCount,
    //   "max storage:",
    //   resourceStorage,
    //   "resources to claim:",
    //   resourcesToClaim
    // );

    return result.set(entity, {
      resourceCount: resourceCount,
      resourcesToClaim,
      resourceStorage: resourceStorage,
      production: productionRate - consumptionRate,
      producedResource: producedResource,
    });
  });

  fullResourceValue.set(spaceRockEntity, {
    time,
    resources: result,
  });
  return result;
}
