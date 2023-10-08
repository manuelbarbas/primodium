import { Coord } from "@latticexyz/utils";
import { SetupNetworkResult } from "src/network/types";

export const upgradeBuilding = async (coord: Coord, network: SetupNetworkResult) => {
  // const building = SelectedBuilding.get()?.value;
  // const buildingType = BuildingType.get(building, {
  //   value: "-1" as Entity,
  // })?.value;
  // const currLevel = Level.get(building)?.value || 0;
  // const activeAsteroid = HomeAsteroid.get()?.value;
  // if (!activeAsteroid) return;
  // const position = { ...coord, parent: activeAsteroid };
  // const receipt = await execute(
  //   systems["system.UpgradeBuilding"].executeTyped(position, {
  //     gasLimit: 10_000_000,
  //   }),
  //   providers
  // );
  // ampli.systemUpgrade({
  //   asteroidCoord: BigNumber.from(activeAsteroid).toString(),
  //   buildingType: BlockIdToKey[buildingType],
  //   coord: [coord.x, coord.y],
  //   currLevel: currLevel,
  //   ...parseReceipt(receipt),
  // });
};
