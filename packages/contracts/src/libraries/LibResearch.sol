// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component
  function hasResearched(BoolComponent component, uint256 entity) internal view returns (bool) {
    return component.has(entity) && component.getValue(entity);
  }

  function hasResearchedWithKey(
    BoolComponent component,
    uint256 researchKey,
    uint256 entity
  ) internal view returns (bool) {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    return component.has(hashedResearchKey) && component.getValue(hashedResearchKey);
  }

  // ###########################################################################
  // Write last researched time into LastResearchedComponent

  function setLastResearched(Uint256Component component, uint256 researchKey, uint256 entity) internal {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    component.set(hashedResearchKey, block.number);
  }

  // ###########################################################################
  // Research

  function researchWithOneItem(
    Uint256Component itemComponent,
    BoolComponent researchComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 researchKey,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    if (hasResearched(researchComponent, hashedResearchKey)) {
      revert("[ResearchSystem] Item already researched");
    }

    uint256 hashedItem1Key = LibEncode.hashKeyEntity(item1Key, entity);
    uint256 curItem1 = LibMath.getSafeUint256Value(itemComponent, hashedItem1Key);

    if (curItem1 < item1Required) {
      revert("[ResearchSystem] Not enough resources");
    } else {
      researchComponent.set(hashedResearchKey);
      itemComponent.set(hashedItem1Key, curItem1 - item1Required);
      return abi.encode(true);
    }
  }

  function researchWithTwoItems(
    Uint256Component itemComponent,
    BoolComponent researchComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 researchKey,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    if (hasResearched(researchComponent, hashedResearchKey)) {
      revert("[ResearchSystem] Item already researched");
    }

    // uint256 hashedItem1Key = LibEncode.hashKeyEntity(item1Key, (entity));
    // uint256 hashedItem2Key = LibEncode.hashKeyEntity(item2Key, (entity));
    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(item1Key, (entity))
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(item2Key, (entity))
    );

    if (curItem1 < item1Required || curItem2 < item2Required) {
      revert("[ResearchSystem] Not enough resources");
    } else {
      researchComponent.set(hashedResearchKey);
      itemComponent.set(LibEncode.hashKeyEntity(item1Key, entity), curItem1 - item1Required);
      itemComponent.set(LibEncode.hashKeyEntity(item2Key, entity), curItem2 - item2Required);
      return abi.encode(true);
    }
  }

  function researchWithThreeItems(
    Uint256Component itemComponent,
    BoolComponent researchComponent,
    uint256 item1Key,
    uint256 item1Required,
    uint256 item2Key,
    uint256 item2Required,
    uint256 item3Key,
    uint256 item3Required,
    uint256 researchKey,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    if (hasResearched(researchComponent, hashedResearchKey)) {
      revert("[ResearchSystem] Item already researched");
    }

    // uint256 hashedItem1Key = LibEncode.hashKeyEntity(item1Key, (entity));
    // uint256 hashedItem2Key = LibEncode.hashKeyEntity(item2Key, (entity));
    // uint256 hashedItem3Key = LibEncode.hashKeyEntity(item3Key, (entity));
    uint256 curItem1 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(item1Key, entity)
    );
    uint256 curItem2 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(item2Key, entity)
    );
    uint256 curItem3 = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(item3Key, entity)
    );

    if (curItem1 < item1Required || curItem2 < item2Required || curItem3 < item3Required) {
      revert("[ResearchSystem] Not enough resources");
    } else {
      researchComponent.set(hashedResearchKey);
      itemComponent.set(LibEncode.hashKeyEntity(item1Key, entity), curItem1 - item1Required);
      itemComponent.set(LibEncode.hashKeyEntity(item2Key, entity), curItem2 - item2Required);
      itemComponent.set(LibEncode.hashKeyEntity(item3Key, entity), curItem3 - item3Required);
      return abi.encode(true);
    }
  }
}
