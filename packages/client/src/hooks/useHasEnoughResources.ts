import { EntityID } from "@latticexyz/recs";
import { getRecipe } from "src/util/resource";
import { useFullResourceCount } from "./useFullResourceCount";

export function useHasEnoughResources(entityId: EntityID) {
  const recipe = getRecipe(entityId);

  const resourcesAmounts = recipe.map((resource) =>
    useFullResourceCount(resource.id, resource.type)
  );

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourcesAmounts[index];

    if (resourceAmount < resource.amount) return false;
  }

  return true;
}
