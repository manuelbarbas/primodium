import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";
import { EntityType } from "@/lib/constants";
import { useFullResourceCount } from "./useFullResourceCount";

export const useFleetCount = ({ asteroid }: { asteroid: Entity }) =>
  useFullResourceCount(EntityType.FleetCount, asteroid as Entity).resourceCount;

export const useFleetStats = (entity: Entity, force?: boolean) => {
  const {
    components,
    utils: { getFleetStats },
  } = useMud();

  const time = components.Time.use()?.value ?? 0n;
  return useMemo(() => getFleetStats(entity), [entity, time, force]);
};
