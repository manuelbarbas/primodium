import { components } from "../components";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "../world";
import { getPlayerFullResourceCounts, isUtility } from "src/util/resource";
import { ResourceStorages } from "src/util/constants";
import { Hex } from "viem";
import { ERock } from "contracts/config/enums";

export const setupPlayerResources = () => {
  const player = components.Account.get()?.value ?? singletonEntity;

  const storePlayerResources = (player: Entity) => {
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
  };

  defineComponentSystem(world, components.BlockNumber, () => {
    storePlayerResources(player);
  });

  defineComponentSystem(world, components.SelectedRock, () => {
    const owner = components.OwnedBy.get(components.SelectedRock.get()?.value ?? singletonEntity)?.value as
      | Entity
      | undefined;
    const rockType = components.RockType.get(components.SelectedRock.get()?.value ?? singletonEntity)?.value;

    if (!owner || owner === player || rockType === ERock.Motherlode) return;

    storePlayerResources(owner);
  });
};
