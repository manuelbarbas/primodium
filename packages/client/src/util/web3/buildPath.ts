import { Coord } from "@latticexyz/utils";

import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const buildPath = async (start: Coord, end: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  console.log("building path", start, end);
  await execute(
    systems["system.BuildPath"].executeTyped(start, end, {
      gasLimit: 2_500_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
