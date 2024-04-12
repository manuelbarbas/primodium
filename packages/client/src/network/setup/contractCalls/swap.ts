import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getEntityTypeName } from "src/util/common";
import { ResourceEnumLookup } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { formatResourceCount } from "src/util/number";
import { getOutAmount } from "src/util/swap";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const swap = async (mud: MUD, marketEntity: Entity, path: Entity[], amountIn: bigint) => {
  const enumPath = path.map((p) => ResourceEnumLookup[p]);
  await execute(
    {
      mud,
      systemId: getSystemId("MarketplaceSystem"),
      functionName: "Primodium__swap",
      args: [marketEntity as Hex, enumPath, amountIn, 0n],
      withSession: true,
    },
    { id: singletonEntity },
    (receipt) => {
      const resourceIn = path[0];
      const resourceOut = path[path.length - 1];
      const amountOut = getOutAmount(amountIn, path);
      const amountInScaled = formatResourceCount(resourceOut, amountIn, { fractionDigits: 2, notLocale: true });
      const amountOutScaled = formatResourceCount(resourceOut, amountOut, { fractionDigits: 2, notLocale: true });

      ampli.systemSwap({
        address: mud.playerAccount.address,
        resourceIn: getEntityTypeName(resourceIn),
        resourceOut: getEntityTypeName(resourceOut),
        amountIn: Number(amountInScaled),
        amountOut: Number(amountOutScaled),

        ...parseReceipt(receipt),
      });
    }
  );
};
