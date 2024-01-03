import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const takeOrders = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  rawOrders: Record<Entity, bigint>
) => {
  const counts = Object.values(rawOrders);
  const orderIds = Object.keys(rawOrders) as Hex[];
  await execute(
    () => account.worldContract.write.takeOrderBulk([orderIds, counts]),
    network,
    {
      id: hashEntities(...[account.entity, ...orderIds]),
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
