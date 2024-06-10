import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

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
