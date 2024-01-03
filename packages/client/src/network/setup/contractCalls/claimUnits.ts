import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const claimUnits = async (network: SetupNetworkResult, account: AnyAccount, rock: Entity) => {
  await execute(
    () => account.worldContract.write.claimUnits([rock as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.ClaimObjective, rock),
    },
    () => {
      null;
    }
  );
};
