import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { Recipe } from "@/utils/core/recipe";

export const useHasEnoughResources = (recipe: Recipe, spaceRock: Entity, count = 1n) => {
  const {
    components,
    utils: { hasEnoughResources },
  } = useCore();

  const time = components.Time.use()?.value ?? 0n;

  return useMemo(() => hasEnoughResources(recipe, spaceRock, count), [time, recipe, count, spaceRock]);
};
