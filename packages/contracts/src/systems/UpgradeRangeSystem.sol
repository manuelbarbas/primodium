// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy, Level, Asteroid } from "codegen/index.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibEncode, LibBuilding } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract UpgradeRangeSystem is PrimodiumSystem {
  function upgradeRange(bytes32 asteroidEntity) public _claimResources(asteroidEntity) {
    bytes32 playerEntity = _player();

    uint256 targetLevel = Level.get(asteroidEntity) + 1;

    require(Asteroid.getMaxLevel(asteroidEntity) >= targetLevel, "[UpgradeRangeSystem] Max level reached");
    require(
      LibBuilding.hasRequiredBaseLevel(asteroidEntity, ExpansionKey, targetLevel),
      "[UpgradeRangeSystem] MainBase level requirement not met"
    );
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[UpgradeRangeSystem] Asteroid not owned by player");

    IWorld(_world()).Primodium__spendUpgradeResources(asteroidEntity, ExpansionKey, targetLevel);

    Level.set(asteroidEntity, targetLevel);
  }
}
