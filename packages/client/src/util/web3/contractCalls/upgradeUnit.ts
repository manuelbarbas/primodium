import { EUnit } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";

export const upgradeUnit = async (unit: EUnit, network: SetupNetworkResult) => {
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;

  if (!activeAsteroid) return;

  const tx = await network.worldContract.write.upgradeUnit([unit]);
  await network.waitForTransaction(tx);

  // ampli.systemUpgradeRange({
  //   asteroidCoord: BigNumber.from(activeAsteroid).toString(),
  //   currLevel: level,
  //   currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
  //   ...parseReceipt(receipt),
  // });
};
