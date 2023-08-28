import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { ArrivalUnitStruct } from "../../../../contracts/types/ethers-contracts/SendUnitsSystem";
import { Position } from "src/network/components/chainComponents";
import { ESendType } from "./types";
import { ampli } from "src/ampli";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";

export const sendUnits = async (
  destinationAsteroid: EntityID,
  arrivalUnits: ArrivalUnitStruct[],
  sendType: ESendType,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  // todo: find a cleaner way to extract this value in all web3 functions
  const originAsteroid = ActiveAsteroid.get()?.value;
  if (!originAsteroid) return;

  const to = Position.get(destinationAsteroid)?.parent;

  if (!to) return;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.SendUnits"].executeTyped(
      arrivalUnits,
      sendType,
      originAsteroid,
      destinationAsteroid,
      to,
      {
        gasLimit: 8_000_000,
      }
    ),
    providers,
    setNotification
  );

  // ampli.systemSendUnits({
  //   asteroidCoord: originAsteroid,
  //   destinationAsteroidCoord: destinationAsteroid,
  //   destinationAsteroidOwner: to,
  //   sendType: enumToLiteralString(sendType),
  //   unitCounts: arrivalUnits.map((unit) => unit.count),
  //   unitTypes: arrivalUnits.map((unit) => BlockIdToKey[unit.unitType]),
  //   ...parseReceipt(receipt),
  // });

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
