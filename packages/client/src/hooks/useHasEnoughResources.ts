import { EntityID } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { hasEnoughResources } from "src/util/resource";

export const useHasEnoughResources = (entity: EntityID, count = 1) => {
  const [enoughResources, setEnoughResources] = useState(false);
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  useEffect(() => {
    setEnoughResources(hasEnoughResources(entity, count));
  }, [blockNumber, entity, count]);

  return enoughResources;
};
