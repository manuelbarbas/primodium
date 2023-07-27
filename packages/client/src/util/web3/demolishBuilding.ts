import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const demolishBuilding = async (pos: Coord, network: Network) => {
  console.log("demolishing", pos);
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Destroy"].executeTyped(pos, {
      gasLimit: 3_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
