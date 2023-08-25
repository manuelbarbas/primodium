import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ESendType } from "./types";

export const send = async (
  arrivalUnits: { unitType: EntityID; count: number }[],
  sendType: ESendType,
  origin: EntityID,
  destination: EntityID,
  to: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  console.log("sending", arrivalUnits, sendType, origin, destination, to);
  await execute(
    systems["system.SendUnits"].executeTyped(
      arrivalUnits,
      sendType,
      origin,
      destination,
      to,
      {
        gasLimit: 30_000_000,
      }
    ),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
