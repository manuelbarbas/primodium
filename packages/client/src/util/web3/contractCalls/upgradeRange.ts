import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";

export const upgradeRange = async (network: SetupNetworkResult) => {
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;

  if (!activeAsteroid) return;

  const tx = await network.worldContract.write.upgradeRange();
  await network.waitForTransaction(tx);

  // ampli.systemUpgradeRange({
  //   asteroidCoord: BigNumber.from(activeAsteroid).toString(),
  //   currLevel: level,
  //   currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
  //   ...parseReceipt(receipt),
  // });
};
