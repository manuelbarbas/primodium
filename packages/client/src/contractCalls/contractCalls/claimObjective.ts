import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Core, ObjectiveEnumLookup, getSystemId, getEntityTypeName, ObjectiveEntityLookup } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ampli } from "src/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createClaimObjective =
  (core: Core, { execute }: ExecuteFunctions) =>
  async (rockEntity: Entity, rawObjective: Entity) => {
    const objective = ObjectiveEnumLookup[rawObjective];
    if (!objective) throw new Error(`Objective ${rawObjective} not found in ObjectiveEnumLookup`);

    await execute(
      {
        functionName: "Pri_11__claimObjective",
        systemId: getSystemId("ClaimObjectiveSystem"),
        args: [rockEntity, objective],
        withSession: true,
      },
      {
        id: `claim-${rawObjective}`,
      },
      (receipt) => {
        ampli.systemClaimObjective({
          objectiveType: getEntityTypeName(ObjectiveEntityLookup[objective]),
          ...parseReceipt(receipt),
        });
      }
    );
  };
