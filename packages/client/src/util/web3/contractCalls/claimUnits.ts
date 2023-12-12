import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const claimUnits = async (rock: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.claimUnits([rock]),
    network,
    {
      id: hashEntities(TransactionQueueType.ClaimObjective, rock),
    },
    () => {
      null;
    }
  );
};
