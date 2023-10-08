import { SetupNetworkResult } from "src/network/types";

export const upgradeRange = async (network: SetupNetworkResult) => {
  // const activeAsteroid = HomeAsteroid.get()?.value;
  // const player = Account.get()?.value;
  // const level = Level.get(player, { value: 1 }).value;
  // const bounds = getPlayerBounds(player!);
  // if (!activeAsteroid) return;
  // const receipt = await execute(
  //   systems["system.UpgradeRange"].executeTyped({
  //     gasLimit: 5_000_000,
  //   }),
  //   providers
  // );
  // ampli.systemUpgradeRange({
  //   asteroidCoord: BigNumber.from(activeAsteroid).toString(),
  //   currLevel: level,
  //   currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
  //   ...parseReceipt(receipt),
  // });
};
