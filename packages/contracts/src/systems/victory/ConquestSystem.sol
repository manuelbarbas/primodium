// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { OwnedBy, Asteroid, LastConquered, P_ConquestConfig } from "codegen/index.sol";
import { EScoreType } from "src/Types.sol";
import { LibScore } from "libraries/LibScore.sol";

contract ConquestSystem is PrimodiumSystem {
  function claimConquestPoints(bytes32 asteroidEntity) public {
    bytes32 playerEntity = _player();
    bytes32 ownerEntity = OwnedBy.get(asteroidEntity);
    require(ownerEntity == playerEntity, "[Conquest] Only owner can claim conquest points");

    uint256 conquestPoints = Asteroid.getConquestPoints(asteroidEntity);
    require(conquestPoints > 0, "[Conquest] No conquest points to claim");

    uint256 lastConquered = LastConquered.get(asteroidEntity);
    bool canConquer = lastConquered + P_ConquestConfig.get() <= block.timestamp;
    require(canConquer, "[Conquest] Asteroid hasn't been held long enough to conquer");

    LibScore.addScore(playerEntity, EScoreType.Conquest, conquestPoints);

    LastConquered.set(asteroidEntity, block.timestamp);
  }
}
