// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LibMath } from "./LibMath.sol";

library LibBuild {
  function buildWithOneItem(Uint256Component item1Component, uint256 item1Required, uint256 entity) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);

    if (curItem1 < item1Required) {
      revert("not enough item1");
    } else {
      item1Component.set(entity, curItem1 - item1Required);
    }
  }

  function buildWithTwoItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    uint256 item1Required,
    uint256 item2Required,
    uint256 entity
  ) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curItem2 = LibMath.getSafeUint256Value(item2Component, entity);

    if (curItem1 < item1Required) {
      revert("not enough item1");
    } else if (curItem2 < item2Required) {
      revert("not enough item2");
    } else {
      item1Component.set(entity, curItem1 - item1Required);
      item2Component.set(entity, curItem2 - item2Required);
    }
  }

  function buildWithThreeItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    Uint256Component item3Component,
    uint256 item1Required,
    uint256 item2Required,
    uint256 item3Required,
    uint256 entity
  ) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curItem2 = LibMath.getSafeUint256Value(item2Component, entity);
    uint256 curItem3 = LibMath.getSafeUint256Value(item3Component, entity);

    if (curItem1 < item1Required) {
      revert("not enough item1");
    } else if (curItem2 < item2Required) {
      revert("not enough item2");
    } else if (curItem3 < item3Required) {
      revert("not enough item3");
    } else {
      item1Component.set(entity, curItem1 - item1Required);
      item2Component.set(entity, curItem2 - item2Required);
      item3Component.set(entity, curItem3 - item3Required);
    }
  }

  function buildWithFourItems(
    Uint256Component item1Component,
    Uint256Component item2Component,
    Uint256Component item3Component,
    Uint256Component item4Component,
    uint256 item1Required,
    uint256 item2Required,
    uint256 item3Required,
    uint256 item4Required,
    uint256 entity
  ) internal {
    uint256 curItem1 = LibMath.getSafeUint256Value(item1Component, entity);
    uint256 curItem2 = LibMath.getSafeUint256Value(item2Component, entity);
    uint256 curItem3 = LibMath.getSafeUint256Value(item3Component, entity);
    uint256 curItem4 = LibMath.getSafeUint256Value(item4Component, entity);

    if (curItem1 < item1Required) {
      revert("not enough item1");
    } else if (curItem2 < item2Required) {
      revert("not enough item2");
    } else if (curItem3 < item3Required) {
      revert("not enough item3");
    } else if (curItem4 < item4Required) {
      revert("not enough item4");
    } else {
      item1Component.set(entity, curItem1 - item1Required);
      item2Component.set(entity, curItem2 - item2Required);
      item3Component.set(entity, curItem3 - item3Required);
      item4Component.set(entity, curItem4 - item4Required);
    }
  }
}
