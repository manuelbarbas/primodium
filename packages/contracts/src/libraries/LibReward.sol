// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// tables
import { P_IsUtility, MaxResourceCount, ResourceCount, P_ResourceReward, P_ResourceRewardData, P_UnitReward, P_UnitRewardData } from "codegen/index.sol";

// libraries
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";

// types
import { EResource } from "src/Types.sol";
/**
 * @title LibReward
 * @dev Library to handle the distribution of rewards on asteroids in a game.
 */
library LibReward {
  /**
   * @notice Distributes both unit and resource rewards to an asteroid based on a given prototype.
   * @param playerEntity The identifier of the player who owns the asteroid.
   * @param asteroidEntity The identifier of the asteroid receiving the rewards.
   * @param prototype The identifier of the prototype that determines the rewards.
   * @dev Calls `receiveUnitRewards` and `receiveResourceRewards` to handle the distribution of different types of rewards.
   */
  function receiveRewards(bytes32 playerEntity, bytes32 asteroidEntity, bytes32 prototype) internal {
    receiveUnitRewards(playerEntity, asteroidEntity, prototype);
    receiveResourceRewards(playerEntity, asteroidEntity, prototype);
  }
  /**
   * @notice Distributes unit rewards to an asteroid based on a given prototype.
   * @param playerEntity The identifier of the player who owns the asteroid.
   * @param asteroidEntity The identifier of the asteroid receiving the unit rewards.
   * @param prototype The identifier of the prototype that determines the unit rewards.
   * @dev Iterates through the units defined in the reward data and increases their count on the asteroid.
   */
  function receiveUnitRewards(bytes32 playerEntity, bytes32 asteroidEntity, bytes32 prototype) internal {
    P_UnitRewardData memory rewardData = P_UnitReward.get(prototype);
    for (uint256 i = 0; i < rewardData.units.length; i++) {
      LibUnit.increaseUnitCount(asteroidEntity, rewardData.units[i], rewardData.amounts[i], true);
    }
  }

  /**
   * @notice Distributes resource rewards to an asteroid based on a given prototype.
   * @param playerEntity The identifier of the player who owns the asteroid.
   * @param asteroidEntity The identifier of the asteroid receiving the resource rewards.
   * @param prototype The identifier of the prototype that determines the resource rewards.
   * @dev Increases resource count or production based on whether the resource is utility or not, ensuring it does not exceed the max resource count.
   */
  function receiveResourceRewards(bytes32 playerEntity, bytes32 asteroidEntity, bytes32 prototype) internal {
    P_ResourceRewardData memory rewardData = P_ResourceReward.get(prototype);
    for (uint256 i = 0; i < rewardData.resources.length; i++) {
      if (P_IsUtility.get(rewardData.resources[i])) {
        LibProduction.increaseResourceProduction(
          asteroidEntity,
          EResource(rewardData.resources[i]),
          rewardData.amounts[i]
        );
      } else {
        require(
          rewardData.amounts[i] + ResourceCount.get(asteroidEntity, rewardData.resources[i]) <=
            MaxResourceCount.get(asteroidEntity, rewardData.resources[i]),
          "[LibReward] Resource count exceeds max"
        );
        LibStorage.increaseStoredResource(asteroidEntity, rewardData.resources[i], rewardData.amounts[i]);
      }
    }
  }
}
