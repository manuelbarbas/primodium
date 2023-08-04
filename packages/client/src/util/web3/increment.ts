import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Counter } from "src/network/components/chainComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const increment = async (entity: EntityID, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);
  await execute(
    systems["system.Increment"].executeTyped(entity, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  const counter = Counter.use();
  ampli.systemIncrement({ currIncrementLevel: counter?.value ?? 0 });
  setTransactionLoading(false);
};
