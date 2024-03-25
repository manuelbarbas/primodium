// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibCombat } from "libraries/LibCombat.sol";

contract S_FleetResolvePirateAsteroidSystem is PrimodiumSystem {
  function resolvePirateAsteroid(bytes32 playerEntity, bytes32 pirateAsteroid) public {
    LibCombat.resolvePirateAsteroid(playerEntity, pirateAsteroid);
  }
}
