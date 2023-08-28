// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_MaxStorageComponent, ID as MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibResource } from "libraries/LibResource.sol";

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
        P_MaxStorageComponent(world.getComponent(MaxStorageComponentID)),
        LibEncode.hashKeyEntity(resourceId, entity)
      );
  }

  function reduceResourceFromStorage(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceId,
    uint32 resourceAmount
  ) internal returns (uint32) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint32 playerResourceAmount = LibMath.getSafe(itemComponent, playerResourceEntity);
    if (playerResourceAmount > resourceAmount) {
      LibResource.updateResourceAmount(
        world,
        playerEntity,
        resourceId,
        LibMath.getSafe(itemComponent, playerResourceEntity) - resourceAmount
      );
      return 0;
    } else {
      LibResource.updateResourceAmount(world, playerEntity, resourceId, 0);
      return resourceAmount - playerResourceAmount;
    }
  }

  function addResourceToStorage(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceId,
    uint32 resourceAmount
  ) internal returns (uint32) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint32 availableSpaceInPlayerStorage = getResourceStorageSpace(world, playerEntity, resourceId);
    if (availableSpaceInPlayerStorage > resourceAmount) {
      LibResource.updateResourceAmount(
        world,
        playerEntity,
        resourceId,
        LibMath.getSafe(itemComponent, playerResourceEntity) + resourceAmount
      );
      return 0;
    } else {
      LibResource.updateResourceAmount(
        world,
        playerEntity,
        resourceId,
        LibMath.getSafe(itemComponent, playerResourceEntity) + availableSpaceInPlayerStorage
      );
      return resourceAmount - availableSpaceInPlayerStorage;
    }
  }
}
