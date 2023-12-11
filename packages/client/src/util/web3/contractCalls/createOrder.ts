import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceEntityLookup, ResourceEnumLookup } from "src/util/constants";
import { bigintToNumber } from "src/util/bigint";

export const createOrder = async (rawResource: Entity, count: bigint, price: bigint, network: SetupNetworkResult) => {
  const resource = ResourceEnumLookup[rawResource];

  await execute(
    () => network.worldContract.write.addOrder([resource, count, price]),
    network,
    {
      id: world.registerEntity(),
    },
    (receipt) => {
      const scaledPrice = BigInt(Number(price) * 1e18) / RESOURCE_SCALE;
      const scaledCount = BigInt(count) * RESOURCE_SCALE;

      ampli.systemAddOrder({
        resourceType: getBlockTypeName(ResourceEntityLookup[resource]),
        resourceCount: bigintToNumber(scaledCount),
        resourcePrice: bigintToNumber(scaledPrice),
        ...parseReceipt(receipt),
      });
      null;
    }
  );
};
