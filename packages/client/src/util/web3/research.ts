import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { BlockIdToKey } from "../constants";

export const research = async (item: EntityID, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);
  await execute(
    systems["system.Research"].executeTyped(item, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  ampli.systemResearch({
    researchType: BlockIdToKey[item],
  });
  setTransactionLoading(false);
};
