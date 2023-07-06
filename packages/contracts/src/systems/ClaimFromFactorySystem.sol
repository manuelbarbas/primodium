// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.ClaimFromFactory"));

contract ClaimFromFactorySystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    // Components

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
