import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const train = async (
  buildingEntity: EntityID,
  type: EntityID,
  count: number,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.TrainUnits"].executeTyped(buildingEntity, type, count, {
      gasLimit: 30_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
