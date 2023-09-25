import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { ReversePosition } from "src/network/components/chainComponents";
import { ampli } from "src/ampli";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";
import { ArrivalUnit, ESendType, ESendTypeToLiteral } from "./types";
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

  setTransactionLoading(true);

  const originAsteroid = ReversePosition.get(encodeCoord(origin))?.value;
  const destinationAsteroid = ReversePosition.get(
    encodeCoord(destination)
  )?.value;

  console.log(arrivalUnits, sendType, origin, destination, to);

  const receipt = await execute(
    systems["system.SendUnits"].executeTyped(
      arrivalUnits,
      sendType,
      { ...origin, parent: 0 },
      { ...destination, parent: 0 },
      to,
      {
        gasLimit: 5_000_000,
      }
    ),
    providers
  );

  ampli.systemSendUnits({
    asteroidCoord: originAsteroid!,
    destinationAsteroidCoord: destinationAsteroid!,
    destinationAsteroidOwner: to,
    sendType: ESendTypeToLiteral[sendType],
    unitCounts: arrivalUnits.map((unit) => unit.count),
    unitTypes: arrivalUnits.map((unit) => BlockIdToKey[unit.unitType]),
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
