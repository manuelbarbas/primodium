// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LibMath } from "./LibMath.sol";

library LibCraft {
  // ###########################################################################
  // Craft

  function craftWithOneItem(
    Uint256Component item1Component,
    uint256 item1Required,
    Uint256Component craftedComponent,
    uint256 entity
  ) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curCrafted = LibMath.getSafeUint256Value(craftedComponent, entity);

    uint256 maxCrafted = curItem1 / item1Required;
    uint256 consumeItem1By = maxCrafted * item1Required;

    item1Component.set(entity, curItem1 - consumeItem1By);
    craftedComponent.set(entity, curCrafted + maxCrafted);
  }

  function craftWithTwoItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    uint256 item1Required,
    uint256 item2Required,
    Uint256Component craftedComponent,
    uint256 entity
  ) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curItem2 = LibMath.getSafeUint256Value(item2Component, entity);
    uint256 curCrafted = LibMath.getSafeUint256Value(craftedComponent, entity);

    uint256 maxCraftedFromItem1 = curItem1 / item1Required;
    uint256 maxCraftedFromItem2 = curItem2 / item2Required;

    uint256 maxCrafted = maxCraftedFromItem1 <= maxCraftedFromItem2 ? maxCraftedFromItem1 : maxCraftedFromItem2;
    uint256 consumeItem1By = maxCrafted * item1Required;
    uint256 consumeItem2By = maxCrafted * item2Required;

    item1Component.set(entity, curItem1 - consumeItem1By);
    item2Component.set(entity, curItem2 - consumeItem2By);
    craftedComponent.set(entity, curCrafted + maxCrafted);
  }
}
