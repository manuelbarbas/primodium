import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { parseReceipt } from "../../analytics/parseReceipt";
import { BlockIdToKey } from "../../constants";

export const buildBuilding = async (network: SetupNetworkResult, coord: Coord, blockType: Entity) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.Home.get()?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  const tx = await network.worldContract.write.build([BigNumber.from(blockType), position]);

  await network.waitForTransaction(tx);

  ampli.systemBuild({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    buildingType: BlockIdToKey[blockType],
    coord: [coord.x, coord.y],
    currLevel: 0,
    ...parseReceipt(undefined),
  });
};
