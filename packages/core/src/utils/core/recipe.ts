import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Hex } from "viem";
import { Components, ResourceType } from "@/types";
import { ResourceEntityLookup } from "@/constants";
import { createResourceUtils } from "@/utils/core/resource";

export function createRecipeUtils(components: Components) {
  const { getFullResourceCount } = createResourceUtils(components);
  function getRecipe(rawEntityType: Entity, level: bigint, upgrade = false) {
    const entityType = rawEntityType as Hex;
    const requiredResources = (
      upgrade ? components.P_RequiredUpgradeResources : components.P_RequiredResources
    ).getWithKeys(
      { prototype: entityType, level: level },
      {
        resources: [],
        amounts: [],
      }
    );
    const requiredProduction = components.P_RequiredDependency.getWithKeys(
      { prototype: entityType, level: level },
      undefined
    );

    const resources = requiredResources.resources.map((resource: EResource, index: number) => ({
      id: ResourceEntityLookup[resource],
      type:
        components.P_IsUtility.getWithKeys({ id: resource })?.value == true
          ? ResourceType.Utility
          : ResourceType.Resource,
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

  function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, spaceRock: Entity, count = 1n) {
    const resourceAmounts = recipe.map((resource) => {
      return getFullResourceCount(resource.id, spaceRock);
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

  function getMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, spaceRock: Entity) {
    const resourceAmounts = recipe.map((resource) => {
      return getFullResourceCount(resource.id, spaceRock);
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
