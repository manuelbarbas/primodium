import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const takeOrders = async (mud: MUD, rawOrders: Record<Entity, bigint>) => {
  const counts = Object.values(rawOrders);
  const orderIds = Object.keys(rawOrders) as Hex[];
  await execute(
    {
      mud,
      functionName: "takeOrderBulk",
      systemId: getSystemId("MarketplaceSystem"),
      args: [orderIds, counts],
      delegate: true,
    },
    {
      id: hashEntities(mud.playerAccount.entity, ...orderIds),
    },
    (receipt) => {
      ampli.systemTakeOrderBulk({
        marketplaceOrderIds: orderIds,
        marketplaceOrderCounts: counts.map((count) => bigintToNumber(count)),
        ...parseReceipt(receipt),
      });
    }
  );
};
