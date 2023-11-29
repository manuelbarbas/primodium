import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getFullResourceCount, getPlayerFullResourceCounts, getFullResourceCounts } from "src/util/resource";

export function useFullResourceCount(resource: Entity, playerEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getFullResourceCount(resource, playerEntity);
  }, [blockNumber, resource, playerEntity]);
}

export function useFullResourceCounts(spaceRockEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getFullResourceCounts(spaceRockEntity);
  }, [blockNumber, spaceRockEntity]);
}

export function usePlayerFullResourceCount(playerEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getPlayerFullResourceCounts(playerEntity);
  }, [blockNumber, playerEntity]);
}
