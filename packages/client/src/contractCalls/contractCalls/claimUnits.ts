import { ampli } from "src/ampli";
import { Core, getSystemId } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createClaimUnits =
  (core: Core, { execute }: ExecuteFunctions) =>
  async (rock: Entity) => {
    await execute(
      {
        functionName: "Pri_11__claimUnits",
        systemId: getSystemId("ClaimUnitsSystem"),
        args: [rock],
        withSession: true,
      },
      {
        id: `claimUnits-${rock}`,
      },
      (receipt) => {
        ampli.systemClaimUnitsSystemPrimodiumClaimUnits({
          spaceRock: rock,
          ...parseReceipt(receipt),
        });
      }
    );
  };
