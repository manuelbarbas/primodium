// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";

contract S_BuildRaidableAsteroidSystem is PrimodiumSystem {
  function buildRaidableAsteroid(bytes32 asteroidEntity) public {
    return LibRaidableAsteroid.buildRaidableAsteroid(asteroidEntity);
  }
}
