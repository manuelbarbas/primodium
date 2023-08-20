// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibMath {
  function increment(Uint32Component component, uint256 entity) internal returns (uint32) {
    uint32 value = getSafe(component, entity) + 1;
    component.set(entity, value);
    return value;
  }

  function getSafe(Uint256Component component, uint256 entity) internal view returns (uint256) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function getSafe(Uint32Component component, uint256 entity) internal view returns (uint32) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function abs(int32 input) internal pure returns (int32) {
    return input < 0 ? -input : input;
  }
  function max(uint32 num1, uint32 num2) internal pure returns (uint32) {
    return num1 > num2 ? num1 : num2;
  }
}
