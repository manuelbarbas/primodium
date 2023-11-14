// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ERock } from "src/Types.sol";
import { RockType, Home } from "codegen/index.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibUnit } from "libraries/LibUnit.sol";

library LibSpaceRock {
  /// @notice update space rock
  /// @param playerEntity the player who owns the rock
  /// @param rock the space rock entity to update
  function updateRock(bytes32 playerEntity, bytes32 rock) internal {
    ERock rockType = ERock(RockType.get(rock));
    require(rockType != ERock.NULL, "[UpdateRockSystem] Rock does not exist");
    LibResource.claimAllResources(playerEntity);
    if (rockType == ERock.Asteroid) {
      LibUnit.claimUnits(playerEntity);
    }
  }

  /// @notice update player home rock
  /// @param playerEntity the player whos home rock to update
  function updateHomeRock(bytes32 playerEntity) internal {
    bytes32 home = Home.getAsteroid(playerEntity);
    require(uint256(home) != 0, "[UpdateRockSystem] Player does not have a home asteroid");
    updateRock(playerEntity, home);
  }
}
