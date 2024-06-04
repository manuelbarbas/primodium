import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";

export function useUnitCounts(entity?: Entity, force = false) {
  const {
    components,
    utils: { getUnitCounts },
  } = useMud();

  const time = components.Time.use(undefined)?.value ?? 0n;

  return useMemo(() => {
    return entity ? getUnitCounts(entity) : (new Map() as Map<Entity, bigint>);
  }, [time, entity, force]);
}
