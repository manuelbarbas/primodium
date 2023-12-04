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
import { getNow } from "./time";

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

// This function exists temporarly as mined motherlode resources are claimed to hom asteroid directly
// in the future we never have to resolve or take into account mutliple space rock resources as they have to manualy transported between space rocks
export function getPlayerFullResourceCounts(playerEntity: Entity) {
  const ownedMotherlodes = comps.OwnedMotherlodes.getWithKeys({ entity: playerEntity as Hex })?.value ?? [];
  const motherlodeResources = ownedMotherlodes.map((value) => getFullResourceCounts(value as Entity));
  const homeResources = getFullResourceCounts();

  const combinedCounts: Record<Entity, ResourceCountData> = {};

  // Function to sum resource counts
  const sumResourceCounts = (resourceCounts: Record<Entity, ResourceCountData>) => {
    for (const rawKey in resourceCounts) {
      const key = rawKey as Entity;
      if (!combinedCounts[key]) {
        combinedCounts[key] = {
          resourceCount: 0n,
          resourcesToClaim: 0n,
          resourceStorage: 0n,
          production: 0n,
          producedResource: 0n,
          consumptionTimeLength: 0n,
        };
      }
      combinedCounts[key].resourceCount += resourceCounts[key].resourceCount;
      combinedCounts[key].resourcesToClaim += resourceCounts[key].resourcesToClaim;
      combinedCounts[key].resourceStorage += resourceCounts[key].resourceStorage;
      combinedCounts[key].production += resourceCounts[key].production;
      combinedCounts[key].producedResource += resourceCounts[key].producedResource;
    }
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
  consumptionTimeLength?: bigint;
};

export function getFullResourceCounts(spaceRockEntity?: Entity) {
  const counts: Record<Entity, ResourceCountData> = {};
  MUDEnums.EResource.forEach((_: string, index: number) => {
    if (index == 0 || index > MUDEnums.EResource.length) return {};
    const resourceEntity = ResourceEntityLookup[index as EResource];
    if (!resourceEntity) return;
    counts[resourceEntity] = getFullResourceCount(resourceEntity, spaceRockEntity);
  });
  return counts;
}

export function getFullResourceCount(resourceID: Entity, spaceRock?: Entity): ResourceCountData {
  let consumptionTimeLength = 0n;
  const player = spaceRock
    ? comps.OwnedBy.getWithKeys({ entity: spaceRock as Hex })?.value
    : comps.Account.get()?.value;

  spaceRock = spaceRock ?? (comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Entity | undefined);
  if (!spaceRock)
    return {
      resourceCount: 0n,
      resourcesToClaim: 0n,
      resourceStorage: 0n,
      production: 0n,
      producedResource: 0n,
    };

  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: spaceRock as Hex })?.value ?? 0n;
  const timeSinceClaimed =
    ((getNow() - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;
  const resource = ResourceEnumLookup[resourceID];

  if (resource == undefined) throw new Error("Resource not found" + resourceID);

  const resourceCount = comps.ResourceCount.getWithKeys({ entity: spaceRock as Hex, resource })?.value ?? 0n;

  const resourceStorage =
    comps.MaxResourceCount.getWithKeys({ entity: spaceRock as Hex, resource: resource })?.value ?? 0n;

  //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
  let productionRate = comps.ProductionRate.getWithKeys({ entity: spaceRock as Hex, resource })?.value ?? 0n;
  let consumptionRate =
    comps.ConsumptionRate.getWithKeys({ entity: spaceRock as Hex, resource: resource })?.value ?? 0n;

  //if they are both equal no change will be made
  if (!player || (productionRate == 0n && consumptionRate == 0n))
    return {
      resourceCount,
      resourcesToClaim: 0n,
      resourceStorage,
      production: 0n,
      producedResource: 0n,
    };

  const producedResource = comps.ProducedResource?.getWithKeys({ entity: player as Hex, resource })?.value ?? 0n;
  //first we calculate production
  let increase = 0n;
  if (productionRate > 0n) {
    //check to see if this resource consumes another resource to be produced
    const consumedResource = comps.P_ConsumesResource.getWithKeys({ resource })?.value;

    //if this resource consumes another resource the maxium time it can be produced is the maximum time that the required resource is consumed

    const producedTime = consumedResource
      ? getFullResourceCount(ResourceEntityLookup[consumedResource as EResource], spaceRock).consumptionTimeLength ??
        timeSinceClaimed
      : timeSinceClaimed;

    //the amount of resource that has been produced
    increase = productionRate * producedTime;

    //if the condumption time for the required resource is less than the time passed than currently production is 0
    if (producedTime < timeSinceClaimed) productionRate = 0n;
  }

  // the maximum amount of resourecs that will decrease if there is enough of the resource available decrease < resourceCount + increase
  let decrease = consumptionRate * timeSinceClaimed;

  //the maximum amount of time from the last update to this current time is the maximum amount of time this resource could have been consumed
  consumptionTimeLength = timeSinceClaimed;

  //if increase and decrease match than nothing to update
  if (increase == decrease)
    return {
      resourceCount: resourceCount,
      resourcesToClaim: 0n,
      resourceStorage: resourceStorage,
      production: 0n,
      producedResource: producedResource,
      consumptionTimeLength,
    };

  if (resourceCount + increase < decrease) {
    //if the decrease is more than the sum of increase and current amount than the sum is tha maximum that can be consumed
    // we use this amount to see how much time the resource can be consumed
    consumptionTimeLength = (resourceCount + increase) / consumptionRate;
    //we use the time length to reduce current resource amount by the difference of the decrease and the increase
    decrease = consumptionRate * consumptionTimeLength;
    //consumption is from current space rock and will be in the future
    consumptionRate = 0n;
  }

  return {
    resourceCount: resourceCount,
    resourcesToClaim:
      resourceCount + increase - decrease > resourceStorage
        ? resourceStorage - resourceCount
        : resourceCount + increase - decrease < 0
        ? -resourceCount
        : increase - decrease,
    resourceStorage: resourceStorage,
    production: productionRate - consumptionRate,
    producedResource: producedResource,
    consumptionTimeLength,
  };
}

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
