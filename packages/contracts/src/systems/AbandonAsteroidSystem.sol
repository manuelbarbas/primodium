// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Asteroid, OwnedBy } from "src/codegen/index.sol";

// given how destructively impactful this function is, it should be within its own system to minimize malicious system delegation calls
contract AbandonAsteroidSystem is PrimodiumSystem {
  function abandonAsteroid(bytes32 asteroidEntity) public _claimResources(asteroidEntity) _claimUnits(asteroidEntity) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[AbandonAsteroidSystem] Entity is not an asteroid");

    require(OwnedBy.get(asteroidEntity) == _player(), "[AbandonAsteroidSystem] Entity is not owned by player");

    world.Primodium__transferAsteroid(asteroidEntity, bytes32(0));
  }
}
