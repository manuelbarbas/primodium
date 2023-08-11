import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { BuildingType, Level } from "src/network/components/chainComponents";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { BlockIdToKey } from "../constants";
import { ampli } from "src/ampli";
import { parseReceipt } from "../analytics/parseReceipt";

export const demolishBuilding = async (coord: Coord, network: Network) => {
  console.log("demolishing", coord);
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  const receipt = await execute(
    systems["system.Destroy"].executeTyped(coord, {
      gasLimit: 3_000_000,
    }),
    providers,
    setNotification
  );

  const building = SelectedBuilding.use()?.value;
  const buildingType = BuildingType.use(building, {
    value: "-1" as EntityID,
  })?.value;
  const currLevel = Level.use(building)?.value || 0;

  ampli.systemDestroy({
    buildingType: BlockIdToKey[buildingType],
    coord: [coord.x, coord.y, 0],
    currLevel: currLevel,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
