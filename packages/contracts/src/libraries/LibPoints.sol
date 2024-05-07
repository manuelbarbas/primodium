// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Points, VictoryStatus, P_GameConfig } from "codegen/index.sol";
import { EPointType } from "src/Types.sol";

/**
 * @title LibPoints
 * @dev Library to manage points updates related to resource changes on asteroids and player totals in a game.
 */
library LibPoints {
  function addPoints(bytes32 playerEntity, EPointType pointsType, uint256 pointsToAdd) internal {
    if (pointsToAdd == 0 || VictoryStatus.getGameOver()) return;
    uint256 count = Points.get(playerEntity, uint8(pointsType));

    Points.set(playerEntity, uint8(pointsType), count + pointsToAdd);
  }

  function subtractPoints(bytes32 playerEntity, EPointType pointsType, uint256 pointsToSubtract) internal {
    if (pointsToSubtract == 0 || VictoryStatus.getGameOver()) return;
    uint256 currentPoints = Points.get(playerEntity, uint8(pointsType));

    if (pointsToSubtract > currentPoints) {
      Points.set(playerEntity, uint8(pointsType), 0);
      return;
    }
    Points.set(playerEntity, uint8(pointsType), currentPoints - pointsToSubtract);
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
