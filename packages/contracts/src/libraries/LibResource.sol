// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues } from "../types.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function hasRequiredResources(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint32 resourceCost = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.values[i], entity)
      );
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
      uint32 playerResourceCount = LibMath.getSafe(itemComponent, playerResourceEntity);

      if (LibMath.getSafe(productionComponent, playerResourceEntity) > 0) {
        playerResourceCount +=
          productionComponent.getValue(playerResourceEntity) *
          uint32(block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceEntity));
      }

      if (resourceCost > playerResourceCount) return false;
    }
    return true;
  }
}
