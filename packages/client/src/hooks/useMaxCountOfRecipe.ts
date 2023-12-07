import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getMaxCountOfRecipe, getRecipe } from "src/util/resource";

export function useMaxCountOfRecipe(recipe: ReturnType<typeof getRecipe>, spaceRock?: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getMaxCountOfRecipe(recipe, spaceRock);
  }, [blockNumber, recipe, spaceRock]);
}
