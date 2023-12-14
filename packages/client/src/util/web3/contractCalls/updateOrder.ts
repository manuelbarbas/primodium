import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { ResourceEnumLookup, UnitEnumLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getScale } from "src/util/resource";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const updateOrder = async (
  id: Entity,
  rawResource: Entity,
  price: bigint,
  count: bigint,
  network: SetupNetworkResult
) => {
  const resource = ResourceEnumLookup[rawResource] ?? UnitEnumLookup[rawResource];
  if (!resource) throw new Error("Invalid resource or unit");
  console.log("updating", id, getBlockTypeName(rawResource), count, price);
  await execute(
    () => network.worldContract.write.updateOrder([id as Hex, resource, count, price]),
    network,
    {
      id: hashEntities(network.playerEntity, id, rawResource),
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

export const cancelOrder = async (id: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.cancelOrder([id as Hex]),
    network,
    {
      id: hashEntities(network.playerEntity, id),
    },
    (receipt) => {
      ampli.systemCancelOrder({
        marketplaceOrderId: id,
        ...parseReceipt(receipt),
      });
    }
  );
};
