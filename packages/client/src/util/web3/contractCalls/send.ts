import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ESendType } from "contracts/config/enums";
import { SetupNetworkResult } from "src/network/types";
import { toHex32 } from "src/util/constants";
import { UnitCountTuple } from "../types";

export const send = async (
  unitCounts: UnitCountTuple,
  sendType: ESendType,
  origin: Coord,
  destination: Coord,
  to: Entity,
  network: SetupNetworkResult
) => {
  const tx = await network.worldContract.write.sendUnits([
    unitCounts,
    sendType,
    { ...origin, parent: toHex32("0") },
    { ...destination, parent: toHex32("0") },
    toHex32(to),
  ]);
  await network.waitForTransaction(tx);
};
