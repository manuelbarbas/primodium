import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ArrivalUnit, ESendType } from "./types";
import { Coord } from "@latticexyz/utils";

export const send = async (
  arrivalUnits: ArrivalUnit[],
  sendType: ESendType,
  origin: Coord,
  destination: Coord,
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
      { ...origin, parent: 0 },
      { ...destination, parent: 0 },
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
