import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getFullResourceCount, getFullResourceCounts } from "src/util/resource";

export function useFullResourceCount(resource: Entity, spaceRockEntity?: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getFullResourceCount(resource, spaceRockEntity);
  }, [blockNumber, resource, spaceRockEntity]);
}

export function useFullResourceCounts(spaceRockEntity?: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getFullResourceCounts(spaceRockEntity);
  }, [blockNumber, spaceRockEntity]);
}
