// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LibEncode } from "./LibEncode.sol";

library LibMath {
  // ###########################################################################
  // Debug Increment function
  function increment(Uint32Component component, uint256 entity) internal {
    uint32 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + 1);
  }

  // ###########################################################################
  function getSafeUint256Value(Uint256Component component, uint256 entity) internal view returns (uint256) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  // ###########################################################################
  function getSafeUint32Value(Uint32Component component, uint256 entity) internal view returns (uint32) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function incrementBy(Uint32Component component, uint256 entity, uint32 incBy) internal {
    uint32 current = getSafeUint32Value(component, entity);
    component.set(entity, current + incBy);
  }
}
