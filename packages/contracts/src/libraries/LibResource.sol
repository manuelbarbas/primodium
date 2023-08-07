// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues } from "../types.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function hasRequiredResources(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      world.getComponent(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint32 resourceCost = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.values[i], entity)
      );
      uint32 playerResourceCount = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity)
      );
      if (resourceCost > playerResourceCount) return false;
    }
    return true;
  }
}
