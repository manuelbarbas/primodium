import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";
dayjs.extend(duration);

/**
 * Checks if an entity is in the grace period.
 * @param entity - The entity to check.
 * @param force - Optional parameter to force the recalculation of the grace period.
 * @returns An object with the following properties:
 *   - inGracePeriod: A boolean indicating if the entity is in the grace period.
 *   - duration: The remaining duration of the grace period in milliseconds.
 */
export const useInGracePeriod = (entity: Entity, force = false) => {
  const { tables } = useCore();
  const time = tables.Time.use()?.value ?? 0n;
  const endTime = tables.GracePeriod.use(entity)?.value ?? 0n;

  return useMemo(() => {
    const inGracePeriod = time < endTime;
    if (!inGracePeriod || !entity) return { inGracePeriod: false, duration: 0n };

    return { inGracePeriod, duration: endTime - time };
  }, [time, endTime, entity, force]);
};
