import { Hex } from "viem";
import { ampli } from "src/ampli";
import { Core, getSystemId } from "@primodiumxyz/core";
import { parseReceipt } from "@/util/analytics/parseReceipt";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";

export const createClaimUnits =
  (core: Core, { execute }: ExecuteFunctions) =>
  async (rock: Entity) => {
    await execute(
      {
        functionName: "Pri_11__claimUnits",
        systemId: getSystemId("ClaimUnitsSystem"),
        args: [rock as Hex],
        withSession: true,
      },
      {
        id: `claimUnits-${rock}`,
      },
      (receipt) => {
        ampli.systemClaimUnitsSystemPrimodiumClaimUnits({
          spaceRock: rock as Hex,
          ...parseReceipt(receipt),
        });
      }
    );
  };
