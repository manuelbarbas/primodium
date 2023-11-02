import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { ObjectiveEnumLookup, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const claimObjective = async (rawObjective: Entity, network: SetupNetworkResult) => {
  const objective = ObjectiveEnumLookup[rawObjective];
  if (!objective) throw new Error(`Objective ${rawObjective} not found in ObjectiveEnumLookup`);

  await execute(
    () => network.worldContract.write.claimObjective([objective]),
    network,
    {
      id: hashEntities(TransactionQueueType.ClaimObjective, rawObjective),
    },
    (receipt) => {
      // handle amplitude here
    }
  );
};
