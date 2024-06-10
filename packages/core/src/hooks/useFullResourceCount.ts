import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

export function useFullResourceCount(resource: Entity, spaceRockEntity: Entity, force = false) {
  const {
    tables,
    utils: { getFullResourceCount },
  } = useCore();
  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    return getFullResourceCount(resource, spaceRockEntity);
  }, [resource, spaceRockEntity, force, time]);
}

export function useFullResourceCounts(spaceRockEntity: Entity, force = false) {
  const {
    tables,
    utils: { getFullResourceCounts },
  } = useCore();
  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    if (spaceRockEntity === singletonEntity) return new Map() as ReturnType<typeof getFullResourceCounts>;
    return getFullResourceCounts(spaceRockEntity);
  }, [spaceRockEntity, force, time]);
}
