import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { ResourceEnumLookup } from "src/util/constants";

export const createOrder = async (
  rawResource: Entity,
  quantity: bigint,
  price: bigint,
  network: SetupNetworkResult
) => {
  const resource = ResourceEnumLookup[rawResource];

  await execute(
    () => network.worldContract.write.addOrder([resource, quantity, price]),
    network,
    {
      id: world.registerEntity(),
    },
    () => {
      null;
    }
  );
};
