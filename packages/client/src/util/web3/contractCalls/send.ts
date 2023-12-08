import { Coord } from "@latticexyz/utils";
import { ESendType } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { bigintToNumber } from "src/util/bigint";
import { UnitEnumLookup } from "src/util/constants";
import { toHex32 } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";
import { UnitCountTuple } from "../types";

export const send = async (
  unitCounts: UnitCountTuple,
  sendType: ESendType,
  origin: Coord,
  destination: Coord,
  to: Hex,
  network: SetupNetworkResult
) => {
  await execute(
    () =>
      network.worldContract.write.sendUnits([
        unitCounts,
        sendType,
        { ...origin, parent: toHex32("0") },
        { ...destination, parent: toHex32("0") },
        to,
      ]),
    network,
    {
      id: world.registerEntity(),
    },
    (receipt) => {
      const originAsteroid = components.ReversePosition.getWithKeys({ x: origin.x, y: origin.y })?.entity;
      const destinationAsteroid = components.ReversePosition.getWithKeys({
        x: destination.x,
        y: destination.y,
      })?.entity;

      ampli.systemSendUnits({
        asteroidCoord: originAsteroid!,
        destinationAsteroidCoord: destinationAsteroid!,
        destinationAsteroidOwner: to,
        sendType: ESendType[sendType],
        unitCounts: unitCounts.map((count) => bigintToNumber(count)),
        unitTypes: Object.keys(UnitEnumLookup).map((key) => key.toString()),
        ...parseReceipt(receipt),
      });
    }
  );
};
