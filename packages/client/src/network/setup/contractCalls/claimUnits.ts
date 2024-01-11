import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const claimUnits = async (mud: MUD, rock: Entity) => {
  await execute(
    mud,
    (account) => account.worldContract.write.claimUnits([rock as Hex]),
    {
      id: hashEntities(TransactionQueueType.ClaimObjective, rock),
      delegate: true,
    },
    () => {
      null;
    }
  );
};
