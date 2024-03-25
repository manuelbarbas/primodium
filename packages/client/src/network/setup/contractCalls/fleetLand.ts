import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

export const landFleet = async (mud: MUD, fleet: Entity, rock: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__landFleet",
      systemId: getSystemId("FleetLandSystem"),
      args: [fleet as Hex, rock as Hex],
      withSession: true,
    },
    {
      id: "landFleet" as Entity,
      type: TransactionQueueType.LandFleet,
    }
  );
};
