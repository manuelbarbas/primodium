import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const mergeFleets = async (mud: MUD, fleets: Entity[]) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__mergeFleets",
      systemId: getSystemId("FleetMergeSystem"),
      args: [fleets as Hex[]],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.MergeFleets, ...fleets),
      type: TransactionQueueType.MergeFleets,
    },
    (receipt) => {
      ampli.systemFleetMergeSystemPrimodiumMergeFleets({
        fleets,
        ...parseReceipt(receipt),
      });
    }
  );
};
