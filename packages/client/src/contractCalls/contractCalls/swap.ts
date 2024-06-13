import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { EObjectives } from "contracts/config/enums";
import { ampli } from "src/ampli";
import {
  AccountClient,
  Core,
  getEntityTypeName,
  getSystemId,
  ResourceEnumLookup,
  formatResourceCount,
} from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Entity, defaultEntity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createSwapCalls =
  ({ utils }: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) =>
  async (marketEntity: Entity, path: Entity[], amountIn: bigint, amountOutMin: bigint) => {
    const enumPath = path.map((p) => ResourceEnumLookup[p]);
    await execute(
      {
        systemId: getSystemId("MarketplaceSystem"),
        functionName: "Pri_11__swap",
        args: [marketEntity, enumPath, amountIn, amountOutMin],
        withSession: true,
      },
      { id: defaultEntity },
      (receipt) => {
        const resourceIn = path[0];
        const resourceOut = path[path.length - 1];
        const amountOut = utils.getOutAmount(amountIn, path);
        const amountInScaled = formatResourceCount(resourceOut, amountIn, { fractionDigits: 2, notLocale: true });
        const amountOutScaled = formatResourceCount(resourceOut, amountOut, {
          fractionDigits: 2,
          notLocale: true,
        });

        ampli.systemSwap({
          address: playerAccount.address,
          resourceIn: getEntityTypeName(resourceIn),
          resourceOut: getEntityTypeName(resourceOut),
          amountIn: Number(amountInScaled),
          amountOut: Number(amountOutScaled),

          ...parseReceipt(receipt),
        });

        makeObjectiveClaimable(playerAccount.entity, EObjectives.MarketSwap);
      }
    );
  };
