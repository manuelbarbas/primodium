import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { EntityType } from "@/lib/constants";
import { useResourceCount } from "./useResourceCount";

/**
 * Gets the fleet count for a given asteroid.
 * @param {Object} options - The options object.
 * @param {Entity} options.asteroid - The asteroid entity.
 * @returns {number} - The fleet count for the asteroid.
 */
export const useFleetCount = ({ asteroid }: { asteroid: Entity }) =>
  useResourceCount(EntityType.FleetCount, asteroid as Entity).resourceCount;

/**
 * Retrieves fleet statistics for a given entity.
 * @param entity - The entity for which to retrieve fleet statistics.
 * @param force - Optional parameter to force the recalculation of fleet statistics.
 * @returns The fleet statistics for the given entity.
 */
export const useFleetStats = (entity: Entity, force?: boolean) => {
  const {
    tables,
    utils: { getFleetStats },
  } = useCore();

  const time = tables.Time.use()?.value ?? 0n;
  return useMemo(() => getFleetStats(entity), [entity, time, force]);
};
