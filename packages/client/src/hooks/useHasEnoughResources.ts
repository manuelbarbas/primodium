import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { Time } from "src/network/components/clientComponents";
import { getRecipe, hasEnoughResources } from "src/util/recipe";

export const useHasEnoughResources = (recipe: ReturnType<typeof getRecipe>, spaceRock: Entity, count = 1n) => {
  const time = Time.use()?.value ?? 0n;

  return useMemo(() => hasEnoughResources(recipe, spaceRock, count), [time, recipe, count, spaceRock]);
};
