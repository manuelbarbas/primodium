import { Entity } from "@latticexyz/recs";
import { EOrderType } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { ResourceEnumLookup, UnitEnumLookup } from "src/util/constants";

export const createOrder = async (
  rawResource: Entity,
  quantity: bigint,
  price: bigint,
  network: SetupNetworkResult
) => {
  const rawResourceId = ResourceEnumLookup[rawResource];
  const { resourceId, type } = rawResourceId
    ? { resourceId: rawResourceId, type: EOrderType.Resource }
    : { resourceId: UnitEnumLookup[rawResource], type: EOrderType.Unit };
  if (!resourceId) {
    throw new Error("Invalid resource or unit");
  }

  await execute(
    () => network.worldContract.write.addOrder([type, resourceId, quantity, price]),
    network,
    {
      id: world.registerEntity(),
    },
    () => {
      null;
    }
  );
};
