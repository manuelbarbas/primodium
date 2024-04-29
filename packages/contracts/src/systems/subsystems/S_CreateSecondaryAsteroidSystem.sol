// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { EMap } from "src/Types.sol";
import { PositionData, Asteroid } from "codegen/index.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract S_CreateSecondaryAsteroidSystem is PrimodiumSystem {
  function createSecondaryAsteroid(PositionData memory positionData) public returns (bytes32) {
    bytes32 asteroidEntity = LibAsteroid.createSecondaryAsteroid(positionData);

    if (Asteroid.getMapId(asteroidEntity) == uint8(EMap.Common)) {
      IWorld(_world()).Primodium__buildRaidableAsteroid(asteroidEntity);
    }

    return asteroidEntity;
  }
}
