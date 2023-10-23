import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SetupNetworkResult } from "src/network/types";
import { ESendType } from "contracts/config/enums";
import { Hex } from "viem";
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
    { ...origin, parent: "0x" },
    { ...destination, parent: "0x" },
    to as Hex,
  ]);
  await network.waitForTransaction(tx);
};
