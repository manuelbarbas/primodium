import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { Recipe } from "@/utils/core/recipe";

/**
 * Checks if there are enough resources available to craft the given recipe using the specified space rock.
 *
 * @param recipe - The recipe to check for resource availability.
 * @param spaceRock - The space rock entity to use for crafting.
 * @param count - The number of times to check for resource availability (default: 1).
 * @returns A boolean indicating whether there are enough resources available.
 */
export const useHasEnoughResources = (recipe: Recipe, spaceRock: Entity, count = 1n) => {
  const {
    tables,
    utils: { hasEnoughResources },
  } = useCore();

  const time = tables.Time.use()?.value ?? 0n;

  return useMemo(() => hasEnoughResources(recipe, spaceRock, count), [time, recipe, count, spaceRock]);
};
