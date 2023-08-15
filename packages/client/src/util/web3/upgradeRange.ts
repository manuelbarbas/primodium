import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const upgradeRange = async (network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  await execute(
    systems["system.UpgradeRange"].executeTyped(),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
