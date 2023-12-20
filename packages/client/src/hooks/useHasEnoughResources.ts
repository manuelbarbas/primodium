import { Entity } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getRecipe, hasEnoughResources } from "src/util/recipe";

export const useHasEnoughResources = (recipe: ReturnType<typeof getRecipe>, spaceRock?: Entity, count = 1n) => {
  const [enoughResources, setEnoughResources] = useState(false);
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  useEffect(() => {
    setEnoughResources(hasEnoughResources(recipe, spaceRock, count));
  }, [blockNumber, recipe, count, spaceRock]);

  return enoughResources;
};
