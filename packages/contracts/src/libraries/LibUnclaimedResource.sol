// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibUnclaimedResource {
  function updateUnclaimedForResource(
    Uint256Component unclaimedResourceComponent, //writes to
    Uint256Component lastClaimedAtComponent, //writes to
    Uint256Component mineComponent,
    Uint256Component storageComponent,
    Uint256Component itemComponent,
    uint256 playerEntity,
    uint256 resourceId
  ) internal {
    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    if (LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity) == block.number) {
      return;
    }
    uint256 playerResourceProduction = LibMath.getSafeUint256Value(mineComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }
    uint256 availableSpaceInStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint256 unclaimedResource = LibMath.getSafeUint256Value(
      unclaimedResourceComponent,
      playerResourceProductionEntity
    ) +
      (playerResourceProduction *
        (block.number - LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity)));

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    unclaimedResourceComponent.set(playerResourceProductionEntity, unclaimedResource);
  }
}
