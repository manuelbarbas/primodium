// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { IWorld } from "solecs/System.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibClaim {
  function addResourceToStorage(
    IWorld world,
    uint256 resourceId,
    uint32 resourceAmount,
    uint256 playerEntity
  ) internal returns (uint32) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint32 availableSpaceInPlayerStorage = LibStorage.getResourceStorageSpace(world, playerEntity, resourceId);
    if (availableSpaceInPlayerStorage > resourceAmount) {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32Value(itemComponent, playerResourceEntity) + resourceAmount
      );
      return 0;
    } else {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32Value(itemComponent, playerResourceEntity) + availableSpaceInPlayerStorage
      );
      return resourceAmount - availableSpaceInPlayerStorage;
    }
  }
}
