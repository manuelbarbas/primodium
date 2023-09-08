import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { parseReceipt } from "../analytics/parseReceipt";

export const reinforce = async (
  rockEntity: EntityID,
  arrivalIndex: number,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.ReceiveReinforcement"].executeTyped(
      rockEntity,
      arrivalIndex,
      {
        gasLimit: 4_000_000,
      }
    ),
    providers,
    setNotification
  );

  ampli.systemReceiveReinforcement({
    asteroidCoord: rockEntity,
    arrivalIndex,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
