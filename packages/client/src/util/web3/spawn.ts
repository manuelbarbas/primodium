import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const spawn = async (network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Spawn"].executeTyped({ gasLimit: 10_000_000 }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
