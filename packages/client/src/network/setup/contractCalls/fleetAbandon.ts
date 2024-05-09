import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const abandonFleet = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__abandonFleet",
      systemId: getSystemId("FleetClearSystem"),
      args: [fleet as Hex],
      withSession: true,
    },
    {
      id: "abandonFleet" as Entity,
      type: TransactionQueueType.AbandonFleet,
    },
    (receipt) => {
      ampli.systemFleetClearSystemPrimodiumAbandonFleet({
        fleets: [fleet as Hex],
        ...parseReceipt(receipt),
      });
    }
  );
};
