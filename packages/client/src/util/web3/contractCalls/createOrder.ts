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
  const { resourceId, type } = rawResource
    ? { resourceId: rawResourceId, type: EOrderType.Resource }
    : { resourceId: UnitEnumLookup[rawResource], type: EOrderType.Unit };

  await execute(
    () => network.worldContract.write.addOrder([resourceId, type, quantity, price]),
    network,
    {
      id: world.registerEntity(),
    },
    () => {
      null;
    }
  );
};
