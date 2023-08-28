import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ReversePosition } from "src/network/components/chainComponents";
import { ampli } from "src/ampli";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";
import { ArrivalUnit, ESendType } from "./types";
import { Coord } from "@latticexyz/utils";
import { encodeCoord } from "../encode";

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

  const originAsteroid = ReversePosition.get(encodeCoord(origin))?.value;
  const destinationAsteroid = ReversePosition.get(
    encodeCoord(destination)
  )?.value;

  const receipt = await execute(
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

  ampli.systemSendUnits({
    asteroidCoord: originAsteroid!,
    destinationAsteroidCoord: destinationAsteroid!,
    destinationAsteroidOwner: to,
    sendType: enumToLiteralString(sendType),
    unitCounts: arrivalUnits.map((unit) => unit.count),
    unitTypes: arrivalUnits.map((unit) => BlockIdToKey[unit.unitType]),
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};

function enumToLiteralString(value: ESendType): "INVADE" | "REINFORCE" {
  if (value === ESendType.INVADE) {
    return "INVADE";
  } else if (value === ESendType.REINFORCE) {
    return "REINFORCE";
  } else {
    throw new Error("Invalid ESendType value");
  }
}
