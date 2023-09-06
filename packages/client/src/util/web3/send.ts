import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { ReversePosition } from "src/network/components/chainComponents";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";
import { encodeCoord } from "../encode";
import { ArrivalUnit, ESendType, ESendTypeToLiteral } from "./types";

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
  const destinationAsteroid = ReversePosition.get(encodeCoord(destination))?.value;

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
