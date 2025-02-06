import { useMemo } from "react";

import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";

/**
 * Gets the count of a specific resource associated with a space rock entity.
 *
 * @param resource - The resource to count.
 * @param spaceRockEntity - The space rock entity to associate the resource with.
 * @param force - Optional parameter to force the recalculation of the resource count.
 * @returns The count of the specified resource associated with the space rock entity.
 */
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

/**
 * Gets the resource counts for a given space rock entity.
 *
 * @param spaceRockEntity - The space rock entity for which to retrieve the resource counts.
 * @param force - Optional parameter indicating whether to force the retrieval of resource counts.
 * @returns The resource counts for the specified space rock entity.
 */
export function useResourceCounts(spaceRockEntity: Entity, force = false) {
  const {
    tables,
    utils: { getResourceCounts },
  } = useCore();
  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    if (spaceRockEntity === defaultEntity) return new Map() as ReturnType<typeof getResourceCounts>;
    return getResourceCounts(spaceRockEntity);
  }, [spaceRockEntity, force, time]);
}
