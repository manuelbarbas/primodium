import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getUnitCounts } from "src/util/unit";

export function useUnitCounts(entity?: Entity) {
  const time = components.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    return entity ? getUnitCounts(entity) : new Map();
  }, [time, entity]);
}
