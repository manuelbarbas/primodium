// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Score } from "codegen/index.sol";
import { EScoreType } from "src/Types.sol";

/**
 * @title LibScore
 * @dev Library to manage score updates related to resource changes on asteroids and player totals in a game.
 */
library LibScore {
  function addScore(bytes32 playerEntity, EScoreType scoreType, uint256 scoreToAdd) internal {
    if (scoreToAdd == 0) return;
    uint256 count = Score.get(playerEntity, uint8(scoreType));

    Score.set(playerEntity, uint8(scoreType), count + scoreToAdd);
  }

  function subtractScore(bytes32 playerEntity, EScoreType scoreType, uint256 scoreToSubtract) internal {
    if (scoreToSubtract == 0) return;
    uint256 currentScore = Score.get(playerEntity, uint8(scoreType));

    if (scoreToSubtract > currentScore) {
      Score.set(playerEntity, uint8(scoreType), 0);
      return;
    }
    Score.set(playerEntity, uint8(scoreType), currentScore - scoreToSubtract);
  }
}
