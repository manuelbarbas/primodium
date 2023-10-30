import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { useGameStore } from "src/store/GameStore";
import { Hex } from "viem";

export const moveBuilding = async (network: SetupNetworkResult, building: Entity, coord: Coord) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const prevPosition = components.Position.get(building);
  const position = { ...coord, parent: activeAsteroid as Hex };
  console.log(building, position);

  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);
  await execute(network.worldContract.write.moveBuilding([prevPosition, position]), network);

  setTransactionLoading(false);
};
