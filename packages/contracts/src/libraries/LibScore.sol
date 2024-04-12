// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Score, VictoryStatus, P_GameConfig } from "codegen/index.sol";
import { EScoreType } from "src/Types.sol";

/**
 * @title LibScore
 * @dev Library to manage score updates related to resource changes on asteroids and player totals in a game.
 */
library LibScore {
  function addScore(bytes32 playerEntity, EScoreType scoreType, uint256 scoreToAdd) internal {
    if (scoreToAdd == 0 || VictoryStatus.getGameOver()) return;
    uint256 count = Score.get(playerEntity, uint8(scoreType));

    Score.set(playerEntity, uint8(scoreType), count + scoreToAdd);
  }

  function subtractScore(bytes32 playerEntity, EScoreType scoreType, uint256 scoreToSubtract) internal {
    if (scoreToSubtract == 0 || VictoryStatus.getGameOver()) return;
    uint256 currentScore = Score.get(playerEntity, uint8(scoreType));

    if (scoreToSubtract > currentScore) {
      Score.set(playerEntity, uint8(scoreType), 0);
      return;
    }
    Score.set(playerEntity, uint8(scoreType), currentScore - scoreToSubtract);
  }

  function addUnitDeaths(uint256 unitDeaths) internal {
    if (VictoryStatus.getGameOver()) return;
    uint256 prevUnitDeaths = VictoryStatus.getUnitDeaths();
    VictoryStatus.setUnitDeaths(prevUnitDeaths + unitDeaths);
    if (prevUnitDeaths + unitDeaths >= P_GameConfig.getUnitDeathLimit()) {
      VictoryStatus.setGameOver(true);
    }
  }
}
