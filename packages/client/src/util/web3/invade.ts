import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";

export const invade = async (rockEntity: EntityID, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.Invade"].executeTyped(rockEntity, {
      gasLimit: 4_000_000,
    }),
    providers,
    setNotification
  );

  ampli.systemInvade({
    asteroidCoord: rockEntity,
    ...parseReceipt(receipt),
  });
  setTransactionLoading(false);
};
