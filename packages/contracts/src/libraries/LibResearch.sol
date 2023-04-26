// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { LibMath } from "./LibMath.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component
  function hasResearched(BoolComponent component, uint256 entity) internal view returns (bool) {
    return component.has(entity) && component.getValue(entity);
  }

  // ###########################################################################
  // Research

  function researchWithOneItem(
    Uint256Component item1Component,
    uint256 item1Required,
    BoolComponent researchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    if (hasResearched(researchComponent, entity)) {
      return abi.encode(false);
    }

    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);

    if (curItem1 < item1Required) {
      return abi.encode(false);
    } else {
      item1Component.set(entity, curItem1 - item1Required);
      researchComponent.set(entity);
      return abi.encode(true);
    }
  }

  function researchWithTwoItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    uint256 item1Required,
    uint256 item2Required,
    BoolComponent researchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    if (hasResearched(researchComponent, entity)) {
      return abi.encode(false);
    }

    uint256 curitem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curitem2 = LibMath.getSafeUint256Value(item2Component, entity);

    if (curitem1 < item1Required || curitem2 < item2Required) {
      return abi.encode(false);
    } else {
      item1Component.set(entity, curitem1 - item1Required);
      item2Component.set(entity, curitem2 - item2Required);
      researchComponent.set(entity);
      return abi.encode(true);
    }
  }

  function researchWithThreeItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    Uint256Component item3Component,
    uint256 item1Required,
    uint256 item2Required,
    uint256 item3Required,
    BoolComponent researchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    if (hasResearched(researchComponent, entity)) {
      return abi.encode(false);
    }

    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curItem2 = LibMath.getSafeUint256Value(item2Component, entity);
    uint256 curItem3 = LibMath.getSafeUint256Value(item3Component, entity);

    if (curItem1 < item1Required || curItem2 < item2Required || curItem3 < item3Required) {
      return abi.encode(false);
    } else {
      item1Component.set(entity, curItem1 - item1Required);
      item2Component.set(entity, curItem2 - item2Required);
      item3Component.set(entity, curItem3 - item3Required);
      researchComponent.set(entity);
      return abi.encode(true);
    }
  }
}
