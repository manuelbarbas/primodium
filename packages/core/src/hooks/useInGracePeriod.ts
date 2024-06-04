import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";
dayjs.extend(duration);

export const useInGracePeriod = (entity: Entity, force = false) => {
  const { components } = useMud();
  const time = components.Time.use()?.value ?? 0n;
  const endTime = components.GracePeriod.use(entity)?.value ?? 0n;

  return useMemo(() => {
    const inGracePeriod = time < endTime;
    if (!inGracePeriod || !entity) return { inGracePeriod: false, duration: 0n };

    return { inGracePeriod, duration: endTime - time };
  }, [time, endTime, entity, force]);
};
