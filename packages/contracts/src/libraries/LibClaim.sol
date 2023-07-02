// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibClaim {
  function addResourceToStorage(
    Uint256Component itemComponent,
    Uint256Component storageComponent,
    uint256 resourceId,
    uint256 resourceAmount,
    uint256 playerEntity
  ) internal returns (uint256) {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint256 availableSpaceInPlayerStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
    if (availableSpaceInPlayerStorage > resourceAmount) {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint256Value(itemComponent, playerResourceEntity) + resourceAmount
      );
      return 0;
    } else {
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint256Value(itemComponent, playerResourceEntity) + availableSpaceInPlayerStorage
      );
      return resourceAmount - availableSpaceInPlayerStorage;
    }
  }
}
