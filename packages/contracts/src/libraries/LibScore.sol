// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { EResource, EUnit } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";

import { P_Transportables, P_IsRecoverable, Level, IsActive, P_ConsumesResource, ConsumptionRate, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_RequiredResources, Score, P_ScoreMultiplier, P_IsUtility, P_RequiredResources, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, P_EnumToPrototype, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/index.sol";
import { AsteroidOwnedByKey, UnitKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

/**
 * @title LibScore
 * @dev Library to manage score updates related to resource changes on asteroids and player totals in a game.
 */
library LibScore {
  /**
   * @notice Updates the score of an asteroid based on changes in resource quantities.
   * @param asteroidEntity The identifier of the asteroid whose score is to be updated.
   * @param resource The type of resource that has been changed.
   * @param value The new total count of the resource.
   * @dev The score is adjusted based on the difference in resource count, multiplied by the resource's score multiplier.
   */
  function updateScore(bytes32 asteroidEntity, uint8 resource, uint256 value) internal {
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
  /**
   * @notice Updates a player's total score based on changes to an asteroid's score.
   * @param playerEntity The identifier of the player whose score is to be updated.
   * @param asteroidEntity The identifier of the asteroid contributing to the score change.
   * @param score The new score of the asteroid.
   * @dev Adjusts the player's total score by the change in the asteroid's score, ensuring no score is subtracted beyond zero.
   */
  function updatePlayerScore(bytes32 playerEntity, bytes32 asteroidEntity, uint256 score) internal {
    uint256 currentScore = Score.get(playerEntity);
    uint256 asteroidScore = Score.get(asteroidEntity);

    if (score < asteroidScore) {
      currentScore -= asteroidScore - score;
    } else {
      currentScore += score - asteroidScore;
    }
    Score.set(playerEntity, currentScore);
  }

  /**
   * @notice Updates a player's score when acquiring or losing an asteroid.
   * @param playerEntity The identifier of the player whose score is to be updated.
   * @param asteroidEntity The identifier of the asteroid being acquired or lost.
   * @param isAcquisition Indicates whether the asteroid is being acquired (true) or lost (false).
   * @dev Adds the asteroid's score to the player's score upon acquisition or subtracts it upon loss.
   */
  function updateScoreOnAsteroid(bytes32 playerEntity, bytes32 asteroidEntity, bool isAquisition) internal {
    uint256 currentAsteroidScore = Score.get(asteroidEntity);
    uint256 currenPlayerScore = Score.get(playerEntity);
    if (isAquisition) Score.set(playerEntity, currenPlayerScore + currentAsteroidScore);
    else Score.set(playerEntity, currenPlayerScore - currentAsteroidScore);
  }
}
