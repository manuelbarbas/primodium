import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { BuildingType, Level } from "src/network/components/chainComponents";
import { EntityID } from "@latticexyz/recs";
import { BlockIdToKey } from "../constants";

export const upgrade = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);
  await execute(
    systems["system.Upgrade"].executeTyped(coord, {
      gasLimit: 5_000_000,
    }),
    providers,
    setNotification
  );
  const building = SelectedBuilding.use()?.value;
  const buildingType = BuildingType.use(building, {
    value: "-1" as EntityID,
  })?.value;
  const currLevel = Level.use(building)?.value || 0;
  ampli.systemUpgrade({
    buildingType: BlockIdToKey[buildingType],
    coord: [coord.x, coord.y, 0],
    currLevel: currLevel,
  });
  setTransactionLoading(false);
};
