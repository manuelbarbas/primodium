import { Coord } from "@latticexyz/utils";
import { ESendType } from "contracts/config/enums";
import { SetupNetworkResult } from "src/network/types";
import { toHex32 } from "src/util/constants";
import { Hex } from "viem";
import { UnitCountTuple } from "../types";
import { execute } from "src/network/actions";

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
    network
  );
};
