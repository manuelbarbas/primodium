import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

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
    }
  );
};
