import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { RESOURCE_SCALE, ResourceEntityLookup, ResourceEnumLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getBlockTypeName } from "src/util/common";
import { bigintToNumber } from "src/util/bigint";

export const updateOrder = async (
  id: Entity,
  rawResource: Entity,
  price: bigint,
  count: bigint,
  network: SetupNetworkResult
) => {
  const resource = ResourceEnumLookup[rawResource];
  await execute(
    () => network.worldContract.write.updateOrder([id as Hex, resource, count, price]),
    network,
    {
      id: hashEntities(network.playerEntity, id, rawResource),
    },
    (receipt) => {
      const scaledPrice = BigInt(Number(price) * 1e18) / RESOURCE_SCALE;
      const scaledCount = BigInt(count) * RESOURCE_SCALE;

      ampli.systemUpdateOrder({
        marketplaceOrderId: id,
        resourceType: getBlockTypeName(ResourceEntityLookup[resource]),
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
