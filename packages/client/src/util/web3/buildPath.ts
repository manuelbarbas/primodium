import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";

import { execute } from "src/network/actions";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BigNumber } from "ethers";

export const buildPath = async (start: Coord, end: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const startPosition = { ...start, parent: activeAsteroid };
  const endPosition = { ...end, parent: activeAsteroid };

  const receipt = await execute(
    systems["system.BuildPath"].executeTyped(startPosition, endPosition, {
      gasLimit: 2_500_000,
    }),
    providers,
    setNotification
  );

  ampli.systemBuildPath({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    coord: [start.x, start.y],
    endCoord: [end.x, end.y],
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
