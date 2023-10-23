import { components } from "src/network/components";
import { useMud } from "./useMud";

export const useFleetMoves = () => {
  const playerEntity = useMud().network.playerEntity;

  const maxMoves = components.MaxMoves.use(playerEntity, {
    value: 0n,
  }).value;

  const movesUsed = components.ArrivalCount.use(playerEntity, {
    value: 0n,
  }).value;

  return maxMoves - movesUsed;
};
