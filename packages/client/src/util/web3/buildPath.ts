import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";

import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";

export const buildPath = async (start: Coord, end: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.BuildPath"].executeTyped(start, end, {
      gasLimit: 2_500_000,
    }),
    providers,
    setNotification
  );

  ampli.systemBuildPath({
    coord: [start.x, start.y, 0],
    endCoord: [end.x, end.y, 0],
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
