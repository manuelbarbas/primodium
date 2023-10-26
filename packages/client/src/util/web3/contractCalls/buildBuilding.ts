import { Coord } from "@latticexyz/utils";
import { Hex } from "viem";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { EBuilding, MUDEnums } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { useGameStore } from "src/store/GameStore";
import { execute } from "src/network/actions";
import { parseReceipt } from "../../analytics/parseReceipt";

export const buildBuilding = async (network: SetupNetworkResult, building: EBuilding, coord: Coord) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid as Hex };

  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);
  const receipt = await execute(network.worldContract.write.build([building, position]), network);

  ampli.systemBuild({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    buildingType: MUDEnums.EBuilding[building],
    coord: [coord.x, coord.y],
    currLevel: 0,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
