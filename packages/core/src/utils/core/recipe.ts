import { Entity } from "@primodiumxyz/reactive-tables";
import { EResource } from "contracts/config/enums";
import { Hex } from "viem";
import { Tables, ResourceType } from "@/lib/types";
import { ResourceEntityLookup } from "@/lib";
import { createResourceUtils } from "@/utils/core/resource";

export type Recipe = {
  id: Entity;
  type: ResourceType;
  amount: bigint;
}[];

export function createRecipeUtils(tables: Tables) {
  const { getResourceCount } = createResourceUtils(tables);

  /**
   * Gets recipe for a given entity and level
   * @param rawEntityType entity (building, unit, etc.)
   * @param level level of the entity
   * @param upgrade whether to get the upgrade recipe (default: false)
   */
  function getRecipe(rawEntityType: Entity, level: bigint, upgrade = false) {
    const entityType = rawEntityType as Hex;
    const requiredResources = (upgrade ? tables.P_RequiredUpgradeResources : tables.P_RequiredResources).getWithKeys(
      { prototype: entityType, level: level },
      {
        resources: [],
        amounts: [],
      }
    );
    const requiredProduction = tables.P_RequiredDependency.getWithKeys(
      { prototype: entityType, level: level },
      undefined
    );

    const resources = requiredResources.resources.map((resource: EResource, index: number) => ({
      id: ResourceEntityLookup[resource],
      type:
        tables.P_IsUtility.getWithKeys({ id: resource })?.value == true ? ResourceType.Utility : ResourceType.Resource,
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

  /**
   * Checks if a space rock has enough resources for the recipe
   */
  function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, spaceRock: Entity, count = 1n) {
    const resourceAmounts = recipe.map((resource) => {
      return getResourceCount(resource.id, spaceRock);
    });

    for (const [index, resource] of recipe.entries()) {
      const resourceAmount = resourceAmounts[index];
      const { resourceCount } = resourceAmount;

      switch (resource.type) {
        case ResourceType.Resource:
          if (resourceCount < resource.amount * count) return false;
          break;
        case ResourceType.ResourceRate:
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

  /** Gets the difference between two recipes */
  function getRecipeDifference(firstRecipe: ReturnType<typeof getRecipe>, secondRecipe: ReturnType<typeof getRecipe>) {
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

  /** Gets the max count of a given recipe */
  function getMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, spaceRock: Entity) {
    const resourceAmounts = recipe.map((resource) => {
      return getResourceCount(resource.id, spaceRock);
    });

    let count;
    for (const [index, resource] of recipe.entries()) {
      const resourceAmount = resourceAmounts[index];
      const { resourceCount, production } = resourceAmount;
      let maxOfResource = 0n;

      if (resource.amount !== 0n)
        switch (resource.type) {
          case ResourceType.Resource:
            maxOfResource = resourceCount / resource.amount;
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

  return {
    getRecipe,
    hasEnoughResources,
    getRecipeDifference,
    getMaxCountOfRecipe,
  };
}
