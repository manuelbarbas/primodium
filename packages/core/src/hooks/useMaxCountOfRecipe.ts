import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";
import { Recipe } from "@/utils/core/recipe";

export function useMaxCountOfRecipe(recipe: Recipe, spaceRock: Entity) {
  const {
    components,
    utils: { getMaxCountOfRecipe },
  } = useMud();

  const { value: blockNumber } = components.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getMaxCountOfRecipe(recipe, spaceRock);
  }, [blockNumber, recipe, spaceRock]);
}
