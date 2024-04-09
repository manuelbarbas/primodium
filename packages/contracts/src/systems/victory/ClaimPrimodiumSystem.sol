// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { OwnedBy, Asteroid, LastConquered, P_ConquestConfig, P_GameConfig, ShardAsteroid } from "codegen/index.sol";
import { EScoreType } from "src/Types.sol";
import { LibScore } from "libraries/LibScore.sol";
import { LibShardAsteroid } from "libraries/LibShardAsteroid.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

contract ClaimPrimodiumSystem is PrimodiumSystem {
  function claimPrimodium(bytes32 asteroidEntity) public {
    bytes32 playerEntity = _player();
    bytes32 ownerEntity = OwnedBy.get(asteroidEntity);
    require(ownerEntity == playerEntity, "[Claim Primodium] Only owner can claim Primodium");

    uint256 primodium = Asteroid.getPrimodium(asteroidEntity);
    require(primodium > 0, "[Claim Primodium] This asteroid does not generate Primodium");

    uint256 lastConquered = LastConquered.get(asteroidEntity);
    uint256 holdTime = (P_ConquestConfig.getHoldTime() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    bool canConquer = lastConquered + holdTime <= block.timestamp;

    require(canConquer, "[Claim Primodium] Asteroid hasn't been held long enough to claim Primodium");

    LibScore.addScore(playerEntity, EScoreType.Primodium, primodium);

    LastConquered.set(asteroidEntity, block.timestamp);
  }

  // @dev like claimUnits and claimResources, this function can be called by anyone
  function claimShardAsteroidPoints(bytes32 asteroidEntity) public {
    bytes32 ownerEntity = OwnedBy.get(asteroidEntity);
    if (ownerEntity == 0) return;

    uint256 lifespan = (P_ConquestConfig.getShardAsteroidLifeSpan() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ShardAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    uint256 lastConquered = LastConquered.get(asteroidEntity);
    uint256 endTime = block.timestamp > explodeTime ? explodeTime : block.timestamp;

    if (endTime > lastConquered) {
      uint256 holdPct = ((endTime - lastConquered) * 100000) / lifespan;
      LibScore.addScore(
        ownerEntity,
        EScoreType.Primodium,
        (holdPct * P_ConquestConfig.getShardAsteroidPoints()) / 100000
      );
    }

    if (block.timestamp >= explodeTime) {
      LibShardAsteroid.explodeShardAsteroid(asteroidEntity);
    } else {
      LastConquered.set(asteroidEntity, block.timestamp);
    }
  }
}
