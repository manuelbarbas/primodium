import { Entity } from "@primodiumxyz/reactive-tables";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";
dayjs.extend(duration);

/**
 * Gets information about the cooldown status of an entity.
 *
 * @param entity - The entity for which to check the cooldown status.
 * @returns An object containing the cooldown status and duration.
 */
export const useInCooldownEnd = (entity: Entity) => {
  const { tables } = useCore();

  const time = tables.Time.use()?.value ?? 0n;
  const endTime = tables.CooldownEnd.use(entity)?.value ?? 0n;

  return useMemo(() => {
    const inCooldown = time < endTime;
    if (!inCooldown || !entity) return { inCooldown: false, duration: 0n };

    return { inCooldown, duration: endTime - time };
  }, [time, endTime, entity]);
};
