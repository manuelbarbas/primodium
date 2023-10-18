import { Entity } from "@latticexyz/recs";
import { EResource, MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { ResourceType, ResourceEnumLookup, SPEED_SCALE, ResourceEntityLookup } from "./constants";
import { getNow } from "./time";

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
  const requiredProduction = comps.P_RequiredDependencies.getWithKeys(
    { prototype: entityType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );

  const resources = requiredResources.resources.map((resource: EResource, index: number) => ({
    id: ResourceEntityLookup[resource],
    type: comps.P_IsUtility.getWithKeys({ id: resource })?.value == true ? ResourceType.Utility : ResourceType.Resource,
    amount: requiredResources.amounts[index],
  }));

  const resourceRate = requiredProduction.resources.map((resource: EResource, index: number) => ({
    id: ResourceEntityLookup[resource],
    type: ResourceType.ResourceRate,
    amount: requiredProduction.amounts[index],
  }));

  return [...resources, ...resourceRate];
}

export function getMotherlodeResource(entity: Entity) {
  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  if (!resource || resource > MUDEnums.EResource.length) return MUDEnums.EResource[0] as Entity;
  return ResourceEntityLookup[resource];
}

export function getFullResourceCount(resourceID: Entity, playerEntity: Entity) {
  // const worldSpeed = comps.P_WorldSpeed.get()?.value ?? SPEED_SCALE;
  const worldSpeed = 100n;

  const resourceCount =
    comps.ResourceCount.getWithKeys({
      entity: playerEntity as Hex,
      resource: ResourceEnumLookup[resourceID] ?? EResource.Iron,
    })?.value ?? 0n;

  const maxStorage =
    comps.MaxResourceCount.getWithKeys({
      entity: playerEntity as Hex,
      resource: ResourceEnumLookup[resourceID] ?? EResource.Iron,
    })?.value ?? 0n;

  const production =
    comps.ProductionRate.getWithKeys({
      entity: playerEntity as Hex,
      resource: ResourceEnumLookup[resourceID] ?? EResource.Iron,
    })?.value ?? 0n;

  const playerLastClaimed = comps.LastClaimedAt.get(playerEntity)?.value ?? 0n;

  const resourcesToClaimFromBuilding = (() => {
    const toClaim = ((getNow() - playerLastClaimed) * production * SPEED_SCALE) / worldSpeed;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  return { resourceCount, resourcesToClaim: resourcesToClaimFromBuilding, maxStorage, production };
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

  let count = 0;
  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production } = resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        count = Math.min(count, Number((resourceCount + resourcesToClaim) / resource.amount));
        break;
      case ResourceType.ResourceRate:
        count = Math.min(count, Number(production / resource.amount));
        break;
      case ResourceType.Utility:
        count = Math.min(count, Number(resourceCount / resource.amount));
        break;
    }
  }

  return count;
}
