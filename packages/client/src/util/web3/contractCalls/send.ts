import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SetupNetworkResult } from "src/network/types";
import { ArrivalUnit, ESendType } from "../types";

export const send = async (
  arrivalUnits: ArrivalUnit[],
  sendType: ESendType,
  origin: Coord,
  destination: Coord,
  to: Entity,
  network: SetupNetworkResult
) => {
  // const originAsteroid = ReversePosition.get(encodeCoord(origin))?.value;
  // const destinationAsteroid = ReversePosition.get(encodeCoord(destination))?.value;
  // const receipt = await execute(
  //   systems["system.SendUnits"].executeTyped(
  //     arrivalUnits,
  //     sendType,
  //     { ...origin, parent: 0 },
  //     { ...destination, parent: 0 },
  //     to,
  //     {
  //       gasLimit: 5_000_000,
  //     }
  //   ),
  //   providers
  // );
  // ampli.systemSendUnits({
  //   asteroidCoord: originAsteroid!,
  //   destinationAsteroidCoord: destinationAsteroid!,
  //   destinationAsteroidOwner: to,
  //   sendType: ESendTypeToLiteral[sendType],
  //   unitCounts: arrivalUnits.map((unit) => unit.count),
  //   unitTypes: arrivalUnits.map((unit) => BlockIdToKey[unit.unitType]),
  //   ...parseReceipt(receipt),
  // });
};
