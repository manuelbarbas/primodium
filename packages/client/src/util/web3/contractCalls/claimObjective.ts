import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { ObjectiveEntityLookup, ObjectiveEnumLookup, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getBlockTypeName } from "src/util/common";

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
      ampli.systemClaimObjective({
        objectiveType: getBlockTypeName(ObjectiveEntityLookup[objective]),
        ...parseReceipt(receipt),
      });
    }
  );
};
