// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library LibMath {
  function abs(int32 input) internal pure returns (int32) {
    return input < 0 ? -input : input;
  }

  function min(uint32 num1, uint32 num2) internal pure returns (uint32) {
    return num1 < num2 ? num1 : num2;
  }

  function max(uint32 num1, uint32 num2) internal pure returns (uint32) {
    return num1 > num2 ? num1 : num2;
  }
}
