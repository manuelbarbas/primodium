// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibCraft {
  // ###########################################################################
  // Craft

  function craftWithOneItem(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 craftedKey,
    uint256 entity
  ) internal {
    uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    uint256 hashedCraftedKey = LibEncode.hashFromAddress(craftedKey, entityToAddress(entity));

    uint256 curItem1 = LibMath.getSafeUint256Value(itemComponent, hashedItem1Key);
    uint256 curCrafted = LibMath.getSafeUint256Value(itemComponent, hashedCraftedKey);

    uint256 maxCrafted = curItem1 / item1Required;
    uint256 consumeItem1By = maxCrafted * item1Required;

    itemComponent.set(hashedItem1Key, curItem1 - consumeItem1By);
    itemComponent.set(hashedCraftedKey, curCrafted + maxCrafted);
  }

  function craftWithTwoItems(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 craftedKey,
    uint256 entity
  ) internal {
    // uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    // uint256 hashedItem2Key = LibEncode.hashFromAddress(item2Key, entityToAddress(entity));
    // uint256 hashedCraftedKey = LibEncode.hashFromAddress(craftedKey, entityToAddress(entity));

    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity))
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item2Key, entityToAddress(entity))
    );
    uint256 curCrafted = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(craftedKey, entityToAddress(entity))
    );

    uint256 maxCraftedFromItem1 = curItem1 / item1Required;
    uint256 maxCraftedFromItem2 = curItem2 / item2Required;
    uint256 maxCrafted = maxCraftedFromItem1 <= maxCraftedFromItem2 ? maxCraftedFromItem1 : maxCraftedFromItem2;

    // uint256 consumeItem1By = maxCrafted * item1Required;
    // uint256 consumeItem2By = maxCrafted * item2Required;

    itemComponent.set(
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity)),
      curItem1 - maxCrafted * item1Required
    );
    itemComponent.set(
      LibEncode.hashFromAddress(item2Key, entityToAddress(entity)),
      curItem2 - maxCrafted * item2Required
    );
    itemComponent.set(LibEncode.hashFromAddress(craftedKey, entityToAddress(entity)), curCrafted + maxCrafted);
  }
}
