// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { IWorld } from "codegen/world/IWorld.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Asteroid, OwnedBy } from "src/codegen/index.sol";

// given how destructively impactful this function is, it should be within its own system to minimize malicious system delegation calls
contract AbandonAsteroidSystem is PrimodiumSystem {
  function abandonAsteroid(
    bytes32 asteroidEntity
  ) public _onlyAsteroidOwner(asteroidEntity) _claimResources(asteroidEntity) _claimUnits(asteroidEntity) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[AbandonAsteroidSystem] Entity is not an asteroid");

    IWorld world = IWorld(_world());
    world.Primodium__transferAsteroid(asteroidEntity, bytes32(0));
  }
}
