import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const craft = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  await execute(
    systems["system.Craft"].executeTyped(position),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
