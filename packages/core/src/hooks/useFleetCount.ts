import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { EntityType } from "@/lib/constants";
import { useResourceCount } from "./useResourceCount";

export const useFleetCount = ({ asteroid }: { asteroid: Entity }) =>
  useResourceCount(EntityType.FleetCount, asteroid as Entity).resourceCount;

export const useFleetStats = (entity: Entity, force?: boolean) => {
  const {
    tables,
    utils: { getFleetStats },
  } = useCore();

  const time = tables.Time.use()?.value ?? 0n;
  return useMemo(() => getFleetStats(entity), [entity, time, force]);
};
