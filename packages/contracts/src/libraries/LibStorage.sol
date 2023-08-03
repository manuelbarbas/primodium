// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnclaimedResource } from "libraries/LibUnclaimedResource.sol";

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

  function updatePlayerStorage(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingId,
    uint32 newLevel,
    bool isDestroy
  ) internal {
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingId, newLevel);

    if (!maxResourceStorageComponent.has(buildingIdNewLevel)) return;
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingId, newLevel - 1);
    uint256[] memory storageResources = maxResourceStorageComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = getResourceMaxStorage(world, playerEntity, storageResources[i]);

      uint32 maxStorageIncrease = getResourceMaxStorage(world, buildingIdNewLevel, storageResources[i]);
      if (!isDestroy && newLevel > 1)
        maxStorageIncrease = maxStorageIncrease - getResourceMaxStorage(world, buildingIdOldLevel, storageResources[i]);
      updateResourceMaxStorage(
        world,
        playerEntity,
        storageResources[i],
        isDestroy ? playerResourceMaxStorage - maxStorageIncrease : playerResourceMaxStorage + maxStorageIncrease
      );
    }
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
