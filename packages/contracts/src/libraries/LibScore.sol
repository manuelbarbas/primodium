// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Score, P_ScoreMultiplier, ResourceCount } from "codegen/index.sol";

/**
 * @title LibScore
 * @dev Library to manage score updates related to resource changes on asteroids and player totals in a game.
 */
library LibScore {
  function addScore(bytes32 asteroidEntity, uint256 scoreToAdd) internal {
    uint256 count = ResourceCount.get(asteroidEntity, resource);
    uint256 currentAsteroidScore = Score.get(asteroidEntity);
    uint256 scoreChangeAmount = P_ScoreMultiplier.get(resource);

    if (scoreChangeAmount == 0) return;

    if (value < count) {
      scoreChangeAmount *= (count - value);
      currentAsteroidScore -= scoreChangeAmount;
    } else {
      scoreChangeAmount *= (value - count);
      currentAsteroidScore += scoreChangeAmount;
    }
    Score.set(asteroidEntity, currentAsteroidScore);
  }

  function subtractScore(bytes32 playerEntity, bytes32 asteroidEntity, uint256 score) internal {
    uint256 currentScore = Score.get(playerEntity);
    uint256 asteroidScore = Score.get(asteroidEntity);

    if (score < asteroidScore) {
      currentScore -= asteroidScore - score;
    } else {
      currentScore += score - asteroidScore;
    }
    Score.set(playerEntity, currentScore);
  }
}
