import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const landFleet = async (mud: MUD, fleet: Entity, rock: Entity) => {
  await execute(
    {
      mud,
      functionName: "landFleet",
      systemId: getSystemId("FleetLandSystem"),
      args: [fleet as Hex, rock as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.LandFleet, fleet, rock),
      type: TransactionQueueType.LandFleet,
    }
  );
};
