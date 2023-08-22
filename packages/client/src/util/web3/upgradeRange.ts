import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const upgradeRange = async (network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  const activeAsteroid = ActiveAsteroid.get()?.value;

  if (!activeAsteroid) return;

  const receipt = await execute(
    systems["system.UpgradeRange"].executeTyped(),
    providers,
    setNotification
  );

  ampli.systemUpgradeRange({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
