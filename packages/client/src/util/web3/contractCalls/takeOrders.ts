import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";
import { bigintToNumber } from "src/util/bigint";

export const takeOrders = async (rawOrders: Record<Entity, bigint>, network: SetupNetworkResult) => {
  const counts = Object.values(rawOrders);
  const orderIds = Object.keys(rawOrders) as Hex[];
  await execute(
    () => network.worldContract.write.takeOrderBulk([orderIds, counts]),
    network,
    {
      id: hashEntities(...[network.playerEntity, ...orderIds]),
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
