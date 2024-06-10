import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { EntityType } from "@/lib/constants";
import { useFullResourceCount } from "./useFullResourceCount";

export const useFleetCount = ({ asteroid }: { asteroid: Entity }) =>
  useFullResourceCount(EntityType.FleetCount, asteroid as Entity).resourceCount;

export const useFleetStats = (entity: Entity, force?: boolean) => {
  const {
    tables,
    utils: { getFleetStats },
  } = useCore();

  const time = tables.Time.use()?.value ?? 0n;
  return useMemo(() => getFleetStats(entity), [entity, time, force]);
};
