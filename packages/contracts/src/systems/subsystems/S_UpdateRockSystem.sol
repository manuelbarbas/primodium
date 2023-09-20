// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { ERock } from "src/Types.sol";
import { RockType, Home } from "codegen/Tables.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibUnit } from "libraries/LibUnit.sol";

contract S_UpdateRockSystem is PrimodiumSystem {
  function updateRock(bytes32 playerEntity, bytes32 rock) public {
    ERock rockType = RockType.get(rock);
    require(rockType != ERock.NULL, "[LibUpdateRock] rock does not exist");
    LibResource.claimAllResources(playerEntity);
    if (rockType == ERock.Asteroid) {
      LibUnit.claimUnits(playerEntity);
    }
  }

  function updateHomeRock(bytes32 playerEntity) public {
    bytes32 home = Home.getAsteroid(playerEntity);
    require(uint256(home) != 0, "[LibUpdateRock] player does not have a home asteroid");
    updateRock(playerEntity, home);
  }
}
