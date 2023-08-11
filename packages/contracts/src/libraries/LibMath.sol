// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibMath {
  function getSafe(Uint256Component component, uint256 entity) internal view returns (uint256) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function getSafe(Uint32Component component, uint256 entity) internal view returns (uint32) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function abs(int32 input) internal pure returns (int32) {
    return input < 0 ? -input : input;
  }
}
