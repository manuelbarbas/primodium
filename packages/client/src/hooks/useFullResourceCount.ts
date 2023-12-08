import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import {
  getFullResourceCount,
  getFullResourceCounts,
  getPlayerFullResourceCount,
  getPlayerFullResourceCounts,
} from "src/util/resource";

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

export function usePlayerFullResourceCounts(playerEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getPlayerFullResourceCounts(playerEntity);
  }, [blockNumber, playerEntity]);
}

export function usePlayerFullResourceCount(resource: Entity, playerEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getPlayerFullResourceCount(resource, playerEntity);
  }, [blockNumber, playerEntity]);
}
