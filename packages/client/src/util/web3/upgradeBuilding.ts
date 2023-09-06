import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { BuildingType, Level } from "src/network/components/chainComponents";
import {
  ActiveAsteroid,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";

export const upgradeBuilding = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
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
    providers,
    setNotification
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
