// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy, Level, Asteroid } from "codegen/index.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibEncode, LibBuilding } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract UpgradeRangeSystem is PrimodiumSystem {
  function upgradeRange(bytes32 spaceRockEntity) public _claimResources(spaceRockEntity) {
    bytes32 playerEntity = _player();

    uint256 targetLevel = Level.get(spaceRockEntity) + 1;

    require(Asteroid.getMaxLevel(spaceRockEntity) >= targetLevel, "[UpgradeRangeSystem] Max level reached");
    require(
      LibBuilding.hasRequiredBaseLevel(spaceRockEntity, ExpansionKey, targetLevel),
      "[UpgradeRangeSystem] MainBase level requirement not met"
    );
    require(OwnedBy.get(spaceRockEntity) == playerEntity, "[UpgradeRangeSystem] Asteroid not owned by player");

    IWorld world = IWorld(_world());
    world.Primodium__spendUpgradeResources(spaceRockEntity, ExpansionKey, targetLevel);

    Level.set(spaceRockEntity, targetLevel);
  }
}
