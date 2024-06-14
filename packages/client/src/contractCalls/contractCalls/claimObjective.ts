import {
  Core,
  ObjectiveEnumLookup,
  getEntityTypeName,
  ObjectiveEntityLookup,
  ExecuteFunctions,
} from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ampli } from "src/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createClaimObjective =
  (core: Core, { execute }: ExecuteFunctions) =>
  async (rockEntity: Entity, rawObjective: Entity) => {
    const objective = ObjectiveEnumLookup[rawObjective];
    if (!objective) throw new Error(`Objective ${rawObjective} not found in ObjectiveEnumLookup`);

    await execute({
      functionName: "Pri_11__claimObjective",

      args: [rockEntity, objective],
      withSession: true,
      txQueueOptions: {
        id: `claim-${rawObjective}`,
      },
      onComplete: (receipt) => {
        ampli.systemClaimObjective({
          objectiveType: getEntityTypeName(ObjectiveEntityLookup[objective]),
          ...parseReceipt(receipt),
        });
      },
    });
  };
