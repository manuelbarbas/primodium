import { EntityID } from "@latticexyz/recs";
import { BytesLike } from "ethers";
import { execute } from "src/network/actions";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const debugComponentDevSystem = async (
  componentId: EntityID,
  entity: EntityID,
  value: BytesLike,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.ComponentDev"].executeTyped(componentId, entity, value, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
