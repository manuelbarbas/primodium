import { ampli } from "@/ampli";
import { Core, ExecuteFunctions } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createClaimUnits =
  (core: Core, { execute }: ExecuteFunctions) =>
  async (rock: Entity) => {
    await execute({
      functionName: "Pri_11__claimUnits",

      args: [rock],
      withSession: true,
      txQueueOptions: {
        id: `claimUnits-${rock}`,
      },
      onComplete: (receipt) => {
        ampli.systemClaimUnitsSystemPrimodiumClaimUnits({
          spaceRock: rock,
          ...parseReceipt(receipt),
        });
      },
    });
  };
