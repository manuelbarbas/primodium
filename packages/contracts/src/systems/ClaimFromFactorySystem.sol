// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "./internal/PrimodiumSystem.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.ClaimFromFactory"));

contract ClaimFromFactorySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public pure override returns (bytes memory) {
    // Components

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public pure returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
