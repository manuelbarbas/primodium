import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const claimUnits = async (mud: MUD, rock: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__claimUnits",
      systemId: getSystemId("ClaimUnitsSystem"),
      args: [rock as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.ClaimObjective, rock),
    },
    () => {
      null;
    }
  );
};
