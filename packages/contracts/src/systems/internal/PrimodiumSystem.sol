// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

contract PrimodiumSystem is System {
  function addressToEntity(address a) internal pure returns (bytes32) {
    return bytes32(uint256(uint160((a))));
  }

  function entityToAddress(bytes32 a) internal pure returns (address) {
    return address(uint160(uint256((a))));
  }
}
