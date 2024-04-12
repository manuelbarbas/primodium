import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getMaxCountOfRecipe, getRecipe } from "src/util/recipe";

export function useMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, spaceRock: Entity) {
  const { value: blockNumber } = components.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getMaxCountOfRecipe(recipe, spaceRock);
  }, [blockNumber, recipe, spaceRock]);
}
