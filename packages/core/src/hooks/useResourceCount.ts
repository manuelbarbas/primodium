import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

export function useResourceCount(resource: Entity, spaceRockEntity: Entity, force = false) {
  const {
    tables,
    utils: { getResourceCount },
  } = useCore();
  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    return getResourceCount(resource, spaceRockEntity);
  }, [resource, spaceRockEntity, force, time]);
}

export function useResourceCounts(spaceRockEntity: Entity, force = false) {
  const {
    tables,
    utils: { getResourceCounts },
  } = useCore();
  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    if (spaceRockEntity === singletonEntity) return new Map() as ReturnType<typeof getResourceCounts>;
    return getResourceCounts(spaceRockEntity);
  }, [spaceRockEntity, force, time]);
}
