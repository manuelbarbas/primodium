import { useMemo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";
import { Recipe } from "@/utils/core/recipe";

/**
 * Calculates the maximum count of a recipe for a given space rock.
 *
 * @param recipe - The recipe to calculate the maximum count for.
 * @param asteroid - The asteroid entity.
 * @returns The maximum count of the recipe for the space rock.
 */
export function useMaxCountOfRecipe(recipe: Recipe, asteroid: Entity) {
  const {
    tables,
    utils: { getMaxCountOfRecipe },
  } = useCore();

  const { value: blockNumber } = tables.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getMaxCountOfRecipe(recipe, asteroid);
  }, [blockNumber, recipe, asteroid]);
}
