import { useMemo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";

/**
 * Gets a map of unit counts for a given entity.
 *
 * @param entity - The entity for which to retrieve the unit counts.
 * @param force - Optional parameter to force the recalculation of unit counts.
 * @returns A memoized map of unit counts for the specified entity.
 */
export function useUnitCounts(entity?: Entity, force = false) {
  const {
    tables,
    utils: { getUnitCounts },
  } = useCore();

  const time = tables.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    return entity ? getUnitCounts(entity) : (new Map() as Map<Entity, bigint>);
  }, [time, entity, force]);
}
