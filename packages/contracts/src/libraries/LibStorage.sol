// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

library LibStorage {
  function getResourceStorageSpace(IWorld world, uint256 entity, uint256 resourceId) internal view returns (uint32) {
    uint32 currentMaxStorage = getResourceMaxStorage(world, entity, resourceId);
    uint32 currentOccupiedStorage = LibMath.getSafeUint32(
      ItemComponent(world.getComponent(ItemComponentID)),
      LibEncode.hashKeyEntity(resourceId, entity)
    );
    if (currentMaxStorage <= currentOccupiedStorage) return 0;
    return currentMaxStorage - currentOccupiedStorage;
  }

  function getResourceMaxStorage(IWorld world, uint256 entity, uint256 resourceId) internal view returns (uint32) {
    return
      LibMath.getSafeUint32(
        MaxStorageComponent(world.getComponent(MaxStorageComponentID)),
        LibEncode.hashKeyEntity(resourceId, entity)
      );
  }

  function updateResourceMaxStorage(IWorld world, uint256 entity, uint256 resourceId, uint32 newMaxStorage) internal {
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(world.getComponent(MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );
    uint256 resourceEntity = LibEncode.hashKeyEntity(resourceId, entity);
    if (!maxStorageComponent.has(resourceEntity)) {
      uint256[] memory storageResourceIds;
      if (maxResourceStorageComponent.has(entity)) {
        storageResourceIds = maxResourceStorageComponent.getValue(entity);
        uint256[] memory updatedResourceIds = new uint256[](storageResourceIds.length + 1);
        for (uint256 i = 0; i < storageResourceIds.length; i++) {
          updatedResourceIds[i] = storageResourceIds[i];
        }
        updatedResourceIds[storageResourceIds.length] = resourceId;
        maxResourceStorageComponent.set(entity, updatedResourceIds);
      } else {
        storageResourceIds = new uint256[](1);
        storageResourceIds[0] = resourceId;
        maxResourceStorageComponent.set(entity, storageResourceIds);
      }
    }
    maxStorageComponent.set(resourceEntity, newMaxStorage);
  }

  function upgradePlayerStorage(IWorld world, uint256 playerEntity, uint256 buildingId, uint32 newLevel) internal {
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingId, newLevel);
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingId, newLevel - 1);
    if (!maxResourceStorageComponent.has(buildingIdNewLevel)) return;

    uint256[] memory storageResources = maxResourceStorageComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = getResourceMaxStorage(world, playerEntity, storageResources[i]);

      uint32 maxStorageIncrease = getResourceMaxStorage(world, buildingIdNewLevel, storageResources[i]) -
        getResourceMaxStorage(world, buildingIdOldLevel, storageResources[i]);

      updateResourceMaxStorage(world, playerEntity, storageResources[i], playerResourceMaxStorage + maxStorageIncrease);
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
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32(itemComponent, playerResourceEntity) + resourceAmount
      );
      return 0;
    } else {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32(itemComponent, playerResourceEntity) + availableSpaceInPlayerStorage
      );
      return resourceAmount - availableSpaceInPlayerStorage;
    }
  }
}
