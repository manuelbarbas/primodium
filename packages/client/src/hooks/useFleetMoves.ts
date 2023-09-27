import { SingletonID } from "@latticexyz/network";
import { ArrivalsSize, MaxMoves } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";

export const useFleetMoves = () => {
  const player = Account.use(undefined, {
    value: SingletonID,
  }).value;

  const maxMoves = MaxMoves.use(player, {
    value: 0,
  }).value;

  const movesUsed = ArrivalsSize.use(player, {
    value: 0,
  }).value;

  return maxMoves - movesUsed;
};
