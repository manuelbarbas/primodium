// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibHealth {
  function getBuildingMaxHealth(uint256 tileId) internal pure returns (uint256) {
    return 100;
  }

  function checkAlive(Uint256Component component, uint256 entity) internal view returns (bool) {
    if (!component.has(entity)) {
      return true;
    } else {
      return component.getValue(entity) > 0;
    }
  }
}
