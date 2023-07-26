// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibClaim {
  function addResourceToStorage(
    Uint32Component itemComponent,
    Uint32Component storageComponent,
    uint256 resourceId,
    uint32 resourceAmount,
    uint256 playerEntity
  ) internal returns (uint32) {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint32 availableSpaceInPlayerStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
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
