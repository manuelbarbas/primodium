import { components } from "../components";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "../world";
import { getPlayerFullResourceCounts, isUtility } from "src/util/resource";
import { ResourceStorages } from "src/util/constants";
import { Hex } from "viem";

export const setupPlayerResources = () => {
  const player = components.Account.get()?.value ?? singletonEntity;

  defineComponentSystem(world, components.BlockNumber, () => {
    const playerResources = getPlayerFullResourceCounts(player);

    {
      Array.from(ResourceStorages).forEach((rawResource) => {
        const resource = rawResource as Entity;
        const fullResourceCount = playerResources[resource];

        if (!fullResourceCount || isUtility(resource) || fullResourceCount.resourceStorage == 0n) return null;
        const entity = encodeEntity(
          { player: "bytes32", resource: "bytes32" },
          { player: player as Hex, resource: resource as Hex }
        );
        components.PlayerResources.set(
          {
            production: fullResourceCount.production,
            resourceStorage: fullResourceCount.resourceStorage,
            resourceCount: fullResourceCount.resourceCount,
            producedResource: fullResourceCount.producedResource,
            resourcesToClaim: fullResourceCount.resourcesToClaim,
          },
          entity
        );
      });
    }
  });
};
