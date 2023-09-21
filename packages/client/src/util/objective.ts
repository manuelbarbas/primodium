export function hasEnoughResources(entityId: EntityID, count = 1) {
  const recipe = getRecipe(entityId);

  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, resource.type);
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production, maxStorage } =
      resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        if (resourceCount + resourcesToClaim < resource.amount * count)
          return false;
        break;
      case ResourceType.ResourceRate:
        if (production < resource.amount * count) return false;
        break;
      case ResourceType.Utility:
        if (
          maxStorage - (resourceCount + resourcesToClaim) <
          resource.amount * count
        )
          return false;
        break;
      default:
        return false;
    }
  }

  return true;
}
