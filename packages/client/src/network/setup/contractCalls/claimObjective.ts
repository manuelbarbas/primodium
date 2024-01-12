import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { getBlockTypeName } from "src/util/common";
import { ObjectiveEntityLookup, ObjectiveEnumLookup, TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const claimObjective = async (mud: MUD, rawObjective: Entity) => {
  const objective = ObjectiveEnumLookup[rawObjective];
  if (!objective) throw new Error(`Objective ${rawObjective} not found in ObjectiveEnumLookup`);

  await execute(
    {
      mud,
      functionName: "claimObjective",
      systemId: getSystemId("ObjectiveSystem"),
      args: [objective],
      delegate: true,
    },
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
