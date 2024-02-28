import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { components } from "src/network/components";
dayjs.extend(duration);

export const useCooldownEnd = (entity: Entity) => {
  const time = components.Time.use()?.value ?? 0n;
  const endTime = components.CooldownEnd.use(entity)?.value ?? 0n;

  return useMemo(() => {
    const inCooldown = time < endTime;
    if (!inCooldown || !entity) return { inCooldown: false, duration: 0n };

    return { inCooldown, duration: endTime - time };
  }, [time, endTime, entity]);
};
