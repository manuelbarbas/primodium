import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { BuildingType, Level } from "src/network/components/chainComponents";
import { EntityID } from "@latticexyz/recs";
import { BlockIdToKey } from "../constants";
import { parseReceipt } from "../analytics/parseReceipt";
import { BigNumber } from "ethers";

export const upgradeBuilding = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);

  const building = SelectedBuilding.get()?.value;
  const buildingType = BuildingType.get(building, {
    value: "-1" as EntityID,
  })?.value;
  const currLevel = Level.get(building)?.value || 0;

  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  const receipt = await execute(
    systems["system.UpgradeBuilding"].executeTyped(position, {
      gasLimit: 5_000_000,
    }),
    providers
  );

  ampli.systemUpgrade({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    buildingType: BlockIdToKey[buildingType],
    coord: [coord.x, coord.y],
    currLevel: currLevel,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
