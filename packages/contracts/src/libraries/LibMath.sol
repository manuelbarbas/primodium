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

  function add(Uint32Component component, uint256 entity, uint32 addend) internal {
    uint32 value = getSafe(component, entity);
    component.set(entity, value + addend);
  }

  function add(Uint256Component component, uint256 entity, uint256 addend) internal {
    uint256 value = getSafe(component, entity);
    component.set(entity, value + addend);
  }

  function subtract(Uint32Component component, uint256 entity, uint32 subtractor) internal {
    uint32 value = getSafe(component, entity);
    require(value >= subtractor, "not enough value to subtract");
    component.set(entity, value - subtractor);
  }

  function abs(int32 input) internal pure returns (int32) {
    return input < 0 ? -input : input;
  }

  function min(uint32 x, uint32 y) internal pure returns (uint32) {
    return x < y ? x : y;
  }
}
