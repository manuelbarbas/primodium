import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { ResourceEnumLookup } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const swap = async (mud: MUD, marketEntity: Entity, path: Entity[], amountIn: bigint) => {
  const enumPath = path.map((p) => ResourceEnumLookup[p]);
  console.log("enumPath", enumPath);
  await execute(
    {
      mud,
      systemId: getSystemId("MarketplaceSystem"),
      functionName: "swap",
      args: [marketEntity as Hex, enumPath, amountIn, 0n],
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
