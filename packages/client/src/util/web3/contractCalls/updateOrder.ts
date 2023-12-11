import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { getBlockTypeName } from "src/util/common";
import { ResourceEnumLookup, UnitEnumLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

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
    () => {
      null;
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
    () => {
      null;
    }
  );
};
