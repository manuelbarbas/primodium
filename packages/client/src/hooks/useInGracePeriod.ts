import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { components } from "src/network/components";
dayjs.extend(duration);

export const useInGracePeriod = (entity: Entity, force = false) => {
  const time = components.Time.use()?.value ?? 0n;
  const endTime = components.GracePeriod.use(entity)?.value ?? 0n;

  return useMemo(() => {
    const inGracePeriod = time < endTime;
    if (!inGracePeriod || !entity) return { inGracePeriod: false, duration: 0 };

    return { inGracePeriod, duration: endTime - time };
  }, [time, endTime, entity, force]);
};
