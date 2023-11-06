import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { useFullResourceCount } from "./useFullResourceCount";
import { useMud } from "./useMud";

export const useFleetMoves = () => {
  const playerEntity = useMud().network.playerEntity;

  const maxMoves = useFullResourceCount(EntityType.FleetMoves, playerEntity).resourceCount;
  const movesUsed = components.ArrivalCount.use(playerEntity, {
    value: 0n,
  }).value;

  return maxMoves - movesUsed;
};
