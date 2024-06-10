import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { Recipe } from "@/utils/core/recipe";

export function useMaxCountOfRecipe(recipe: Recipe, spaceRock: Entity) {
  const {
    tables,
    utils: { getMaxCountOfRecipe },
  } = useCore();

  const { value: blockNumber } = tables.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getMaxCountOfRecipe(recipe, spaceRock);
  }, [blockNumber, recipe, spaceRock]);
}
