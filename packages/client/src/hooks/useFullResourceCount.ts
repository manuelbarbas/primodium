import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getFullResourceCount, getFullResourceCounts } from "src/util/resource";

export function useFullResourceCount(resource: Entity, spaceRockEntity?: Entity) {
  const time = components.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    if (spaceRockEntity === singletonEntity) return new Map();
    return getFullResourceCount(resource, spaceRockEntity);
  }, [time, resource, spaceRockEntity]);
}

export function useFullResourceCounts(spaceRockEntity?: Entity) {
  const time = components.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    if (spaceRockEntity === singletonEntity) return new Map();
    return getFullResourceCounts(spaceRockEntity);
  }, [time, spaceRockEntity]);
}
