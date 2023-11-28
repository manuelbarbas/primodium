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
  const ownedMotherlodes = comps.OwnedMotherlodes?.getWithKeys({ entity: playerEntity as Hex })?.value ?? [];

  const homeFullResourceCounts = getFullResourceCounts(comps.Home.get(playerEntity)?.asteroid as Entity);

  const ownedMotherlodeFulLResourceCounts = ownedMotherlodes?.map((value) => {
    return getFullResourceCounts(value as Entity);
  });

  return homeFullResourceCounts.map((value, index) => {
    let resourcesToClaim = value?.resourcesToClaim ?? 0n;
    let production = value?.production ?? 0n;
    for (let i = 0; i < ownedMotherlodes.length; i++) {
      resourcesToClaim += ownedMotherlodeFulLResourceCounts[i][index]?.resourcesToClaim ?? 0n;
      const motherlodeProduction = ownedMotherlodeFulLResourceCounts[i][index].production ?? 0n;
      if (motherlodeProduction > 0) production += motherlodeProduction;
    }
    return {
      resourceCount: value.resourceCount,
      resourcesToClaim: resourcesToClaim,
      resourceStorage: value.resourceStorage,
      production: production,
      producedResource: value.producedResource,
    };
  });
}

export function getFullResourceCounts(spaceRockEntity: Entity) {
  const consumptionTimeLengths: bigint[] = [];
  consumptionTimeLengths.length = MUDEnums.EResource.length;
  const player = comps.OwnedBy.getWithKeys({ entity: spaceRockEntity as Hex })?.value ?? comps.Account.get()?.value;
  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: spaceRockEntity as Hex })?.value ?? 0n;
  const timeSinceClaimed =
    ((getNow() - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;
  return MUDEnums.EResource.map((resource: string, index: number) => {
    if (index == 0 || index > MUDEnums.EResource.length) return {};

    let resourceCount =
      comps.ResourceCount.getWithKeys({ entity: spaceRockEntity as Hex, resource: index as EResource })?.value ?? 0n;

    let resourceStorage =
      comps.MaxResourceCount.getWithKeys({ entity: spaceRockEntity as Hex, resource: index as EResource })?.value ?? 0n;

    const producedResource = player
      ? comps.ProducedResource?.getWithKeys({ entity: player as Hex, resource: index as EResource })?.value ?? 0n
      : 0n;
    //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
    let productionRate =
      comps.ProductionRate.getWithKeys({ entity: spaceRockEntity as Hex, resource: index as EResource })?.value ?? 0n;
    let consumptionRate =
      comps.ConsumptionRate.getWithKeys({ entity: spaceRockEntity as Hex, resource: index as EResource })?.value ?? 0n;

    //if they are both equal no change will be made
    if (productionRate == 0n && consumptionRate == 0n)
      return {
        resourceCount:
          comps.ResourceCount.getWithKeys({ entity: spaceRockEntity as Hex, resource: index as EResource })?.value ??
          0n,
        resourcesToClaim: 0n,
        resourceStorage: resourceStorage,
        production: 0n,
        producedResource: producedResource,
      };

    //first we calculate production
    let increase = 0n;
    if (productionRate > 0n) {
      //check to see if this resource consumes another resource to be produced
      const consumesResource = comps.P_ConsumesResource.getWithKeys({ resource: index as EResource })?.value ?? 0;

      //if this resource consumes another resource the maxium time it can be produced is the maximum time that the required resource is consumed
      const producedTime = consumesResource > 0 ? consumptionTimeLengths[consumesResource] : timeSinceClaimed;

      //the amount of resource that has been produced
      increase = productionRate * producedTime;

      //if the condumption time for the required resource is less than the time passed than currently production is 0
      if (producedTime < timeSinceClaimed) productionRate = 0n;
    }

    // the maximum amount of resourecs that will decrease if there is enough of the resource available decrease < resourceCount + increase
    let decrease = consumptionRate * timeSinceClaimed;

    //the maximum amount of time from the last update to this current time is the maximum amount of time this resource could have been consumed
    consumptionTimeLengths[index] = timeSinceClaimed;

    //if increase and decrease match than nothing to update
    if (increase == decrease)
      return {
        resourceCount: resourceCount,
        resourcesToClaim: 0n,
        resourceStorage: resourceStorage,
        production: 0n,
        producedResource: producedResource,
      };

    if (resourceCount + increase < decrease) {
      //if the decrease is more than the sum of increase and current amount than the sum is tha maximum that can be consumed
      // we use this amount to see how much time the resource can be consumed
      consumptionTimeLengths[index] = (resourceCount + increase) / consumptionRate;
      //we use the time length to reduce current resource amount by the difference of the decrease and the increase
      decrease = consumptionRate * consumptionTimeLengths[index];
      //consumption is from current space rock and will be in the future
      consumptionRate = 0n;
    }

    const motherlode = comps.Motherlode.getWithKeys({ entity: spaceRockEntity as Hex });
    if (player && motherlode && motherlode.motherlodeType == index) {
      resourceStorage =
        comps.MaxResourceCount.getWithKeys({
          entity: comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Hex,
          resource: index as EResource,
        })?.value ?? 0n;
      resourceCount =
        comps.ResourceCount.getWithKeys({
          entity: comps.Home.getWithKeys({ entity: player as Hex })?.asteroid as Hex,
          resource: index as EResource,
        })?.value ?? 0n;
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
    };
  });
}

export function getFullResourceCount(resourceID: Entity, playerEntity?: Entity) {
  const worldSpeed = comps.P_GameConfig.get()?.worldSpeed ?? 100n;
  const resource = ResourceEnumLookup[resourceID];

  if (resource == undefined) throw new Error("Resource not found" + resourceID);

  playerEntity = playerEntity ?? comps.Account.get()?.value;
  if (!playerEntity) throw new Error("No player entity");
  const activeAsteroid = comps.Home.get(playerEntity)?.asteroid;
  if (!activeAsteroid) throw new Error("No active asteroid");

  const ownedMotherlodes = comps.OwnedMotherlodes.get(playerEntity)?.value;
  let motherlodeProduction = 0n;
  if (ownedMotherlodes) {
    for (let i = 0; i < (ownedMotherlodes?.length ?? 0n); i++) {
      motherlodeProduction +=
        comps.ProductionRate.getWithKeys({ entity: ownedMotherlodes[i] as Hex, resource })?.value ?? 0n;
    }
  }

  const producedCount =
    comps.ProducedResource.getWithKeys({
      entity: playerEntity as Hex,
      resource,
    })?.value ?? 0n;
  const resourceCount =
    comps.ResourceCount.getWithKeys({
      entity: activeAsteroid as Hex,
      resource,
    })?.value ?? 0n;

  const maxStorage =
    comps.MaxResourceCount.getWithKeys({
      entity: activeAsteroid as Hex,
      resource,
    })?.value ?? 0n;

  const consumesResource = comps.P_ConsumesResource.getWithKeys({ resource });

  const production =
    motherlodeProduction +
    (comps.ProductionRate.getWithKeys({
      entity: activeAsteroid as Hex,
      resource,
    })?.value ?? 0n) -
    (comps.ConsumptionRate.getWithKeys({
      entity: activeAsteroid as Hex,
      resource,
    })?.value ?? 0n);

  const playerLastClaimed = comps.LastClaimedAt.getWithKeys({ entity: activeAsteroid as Hex })?.value ?? 0n;

  const resourcesToClaimFromBuilding = (() => {
    const toClaim = ((getNow() - playerLastClaimed) * production * worldSpeed) / SPEED_SCALE;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    else if (resourceCount + toClaim < 0n) return -resourceCount;
    return toClaim;
  })();

  return {
    resourceCount,
    resourcesToClaim: resourcesToClaimFromBuilding,
    maxStorage,
    production: (production * worldSpeed) / SPEED_SCALE,
    producedCount,
  };
}

export function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, playerEntity: Entity, count = 1n) {
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, playerEntity);
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

export function getMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, playerEntity: Entity) {
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, playerEntity);
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
