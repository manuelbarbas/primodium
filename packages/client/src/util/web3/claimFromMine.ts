import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BigNumber } from "ethers";

export const claimFromMine = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  const receipt = await execute(
    systems["system.ClaimFromMine"].executeTyped(position, {
      gasLimit: 5_000_000,
    }),
    providers,
    setNotification
  );

  ampli.systemClaimFromMine({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    coord: [coord.x, coord.y],
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
