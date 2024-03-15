// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { Position, PositionData } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";

contract S_InitializeSpaceRockOwnershipSystem is PrimodiumSystem {
  function initializeSpaceRockOwnership(bytes32 spaceRock, bytes32 owner) public {
    LibAsteroid.initializeSpaceRockOwnership(spaceRock, owner);
  }
}
