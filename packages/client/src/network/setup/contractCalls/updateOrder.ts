import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { ResourceEnumLookup, UnitEnumLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getScale } from "src/util/resource";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const updateOrder = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  id: Entity,
  rawResource: Entity,
  price: bigint,
  count: bigint
) => {
  const resource = ResourceEnumLookup[rawResource] ?? UnitEnumLookup[rawResource];
  if (!resource) throw new Error("Invalid resource or unit");
  console.log("updating", id, getBlockTypeName(rawResource), count, price);
  await execute(
    () => account.worldContract.write.updateOrder([id as Hex, resource, count, price]),
    network,
    {
      id: hashEntities(account.entity, id, rawResource),
    },
    (receipt) => {
      const scale = getScale(rawResource);
      const scaledPrice = (price * BigInt(1e18)) / scale;
      const scaledCount = BigInt(count) * scale;

      ampli.systemUpdateOrder({
        marketplaceOrderId: id,
        resourceType: getBlockTypeName(rawResource),
        resourceCount: bigintToNumber(scaledCount),
        resourcePrice: bigintToNumber(scaledPrice),
        ...parseReceipt(receipt),
      });
    }
  );
};

export const cancelOrder = async (network: SetupNetworkResult, account: AnyAccount, id: Entity) => {
  await execute(
    () => account.worldContract.write.cancelOrder([id as Hex]),
    network,
    {
      id: hashEntities(account.entity, id),
    },
    (receipt) => {
      ampli.systemCancelOrder({
        marketplaceOrderId: id,
        ...parseReceipt(receipt),
      });
    }
  );
};
