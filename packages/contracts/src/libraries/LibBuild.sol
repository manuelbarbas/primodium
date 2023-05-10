// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibBuild {
  function buildWithOneItem(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 entity
  ) internal {
    // uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity))
    );

    if (curItem1 < item1Required) {
      revert("[BuildSystem] Not enough resources");
    } else {
      itemComponent.set(LibEncode.hashFromAddress(item1Key, entityToAddress(entity)), curItem1 - item1Required);
    }
  }

  function buildWithTwoItems(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 entity
  ) internal {
    // uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    // uint256 hashedItem2Key = LibEncode.hashFromAddress(item2Key, entityToAddress(entity));

    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity))
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item2Key, entityToAddress(entity))
    );

    if (curItem1 < item1Required || curItem2 < item2Required) {
      revert("[BuildSystem] Not enough resources");
    } else {
      itemComponent.set(LibEncode.hashFromAddress(item1Key, entityToAddress(entity)), curItem1 - item1Required);
      itemComponent.set(LibEncode.hashFromAddress(item2Key, entityToAddress(entity)), curItem2 - item2Required);
    }
  }

  function buildWithThreeItems(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 item3Key,
    uint256 item3Required,
    uint256 entity
  ) internal {
    // uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    // uint256 hashedItem2Key = LibEncode.hashFromAddress(item2Key, entityToAddress(entity));
    // uint256 hashedItem3Key = LibEncode.hashFromAddress(item3Key, entityToAddress(entity));

    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity))
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item2Key, entityToAddress(entity))
    );
    uint256 curItem3 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item3Key, entityToAddress(entity))
    );

    if (curItem1 < item1Required || curItem2 < item2Required || curItem3 < item3Required) {
      revert("[BuildSystem] Not enough resources");
    } else {
      itemComponent.set(LibEncode.hashFromAddress(item1Key, entityToAddress(entity)), curItem1 - item1Required);
      itemComponent.set(LibEncode.hashFromAddress(item2Key, entityToAddress(entity)), curItem2 - item2Required);
      itemComponent.set(LibEncode.hashFromAddress(item3Key, entityToAddress(entity)), curItem3 - item3Required);
    }
  }

  function buildWithFourItems(
    Uint256Component itemComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 item3Key,
    uint256 item3Required,
    uint256 item4Key,
    uint256 item4Required,
    uint256 entity
  ) internal {
    // uint256 hashedItem1Key = LibEncode.hashFromAddress(item1Key, entityToAddress(entity));
    // uint256 hashedItem2Key = LibEncode.hashFromAddress(item2Key, entityToAddress(entity));
    // uint256 hashedItem3Key = LibEncode.hashFromAddress(item3Key, entityToAddress(entity));
    // uint256 hashedItem4Key = LibEncode.hashFromAddress(item4Key, entityToAddress(entity));

    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item1Key, entityToAddress(entity))
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item2Key, entityToAddress(entity))
    );
    uint256 curItem3 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item3Key, entityToAddress(entity))
    );
    uint256 curItem4 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashFromAddress(item4Key, entityToAddress(entity))
    );

    if (curItem1 < item1Required || curItem2 < item2Required || curItem3 < item3Required || curItem4 < item4Required) {
      revert("[BuildSystem] Not enough resources");
    } else {
      itemComponent.set(LibEncode.hashFromAddress(item1Key, entityToAddress(entity)), curItem1 - item1Required);
      itemComponent.set(LibEncode.hashFromAddress(item2Key, entityToAddress(entity)), curItem2 - item2Required);
      itemComponent.set(LibEncode.hashFromAddress(item3Key, entityToAddress(entity)), curItem3 - item3Required);
      itemComponent.set(LibEncode.hashFromAddress(item4Key, entityToAddress(entity)), curItem4 - item4Required);
    }
  }
}
