import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const mergeFleets = async (mud: MUD, fleets: Entity[]) => {
  await execute(
    {
      mud,
      functionName: "Primodium__mergeFleets",
      systemId: getSystemId("FleetMergeSystem"),
      args: [fleets as Hex[]],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.MergeFleets, ...fleets),
      type: TransactionQueueType.MergeFleets,
    }
  );
};
