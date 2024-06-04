import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getRecipe, hasEnoughResources } from "src/util/recipe";

export const useHasEnoughResources = (recipe: ReturnType<typeof getRecipe>, spaceRock: Entity, count = 1n) => {
  const time = components.Time.use()?.value ?? 0n;

  return useMemo(() => hasEnoughResources(recipe, spaceRock, count), [time, recipe, count, spaceRock]);
};
