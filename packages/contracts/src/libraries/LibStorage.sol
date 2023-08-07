// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

library LibStorage {
  function getResourceStorageSpace(IWorld world, uint256 entity, uint256 resourceId) internal view returns (uint32) {
    uint32 currentMaxStorage = getResourceMaxStorage(world, entity, resourceId);
    uint32 currentOccupiedStorage = LibMath.getSafe(
      ItemComponent(world.getComponent(ItemComponentID)),
      LibEncode.hashKeyEntity(resourceId, entity)
    );
    if (currentMaxStorage <= currentOccupiedStorage) return 0;
    return currentMaxStorage - currentOccupiedStorage;
  }

  function getResourceMaxStorage(IWorld world, uint256 entity, uint256 resourceId) internal view returns (uint32) {
    return
      LibMath.getSafe(
        MaxStorageComponent(world.getComponent(MaxStorageComponentID)),
        LibEncode.hashKeyEntity(resourceId, entity)
      );
  }

  function addResourceToStorage(
    IWorld world,
    uint256 resourceId,
    uint32 resourceAmount,
    uint256 playerEntity
  ) internal returns (uint32) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint32 availableSpaceInPlayerStorage = getResourceStorageSpace(world, playerEntity, resourceId);
    if (availableSpaceInPlayerStorage > resourceAmount) {
      itemComponent.set(playerResourceEntity, LibMath.getSafe(itemComponent, playerResourceEntity) + resourceAmount);
      return 0;
    } else {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafe(itemComponent, playerResourceEntity) + availableSpaceInPlayerStorage
      );
      return resourceAmount - availableSpaceInPlayerStorage;
    }
  }
}
