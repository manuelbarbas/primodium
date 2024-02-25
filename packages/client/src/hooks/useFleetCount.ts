import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { getFleetStats } from "src/util/unit";
import { useFullResourceCount } from "./useFullResourceCount";
import { useMud } from "./useMud";

export const useFleetCount = ({ asteroid }: { asteroid: Entity }) => {
  const playerEntity = useMud().playerAccount.entity;
  const home = components.Home.get(playerEntity)?.value;
  if (!home) throw new Error("No home found");

  const maxMoves = useFullResourceCount(EntityType.FleetCount, asteroid as Entity).resourceCount;
  return maxMoves;
};

export const useFleetStats = (entity: Entity) => {
  const time = components.Time.use()?.value ?? 0n;
  return useMemo(() => getFleetStats(entity), [entity, time]);
};
