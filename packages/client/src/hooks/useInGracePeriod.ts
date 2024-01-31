import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { components } from "src/network/components";
import { Hex } from "viem";
dayjs.extend(duration);

export const useInGracePeriod = (entity: Entity) => {
  const time = components.Time.use()?.value ?? 0n;
  const endTime = components.GracePeriod.useWithKeys({ entity: entity as Hex })?.value ?? 0n;
  return useMemo(() => {
    const inGracePeriod = time < endTime;
    if (!inGracePeriod) return { inGracePeriod: false, duration: dayjs.duration(0) };
    const duration = dayjs.duration(Number(endTime - time) * 1000);

    return { inGracePeriod, duration };
  }, [time, endTime]);
};
