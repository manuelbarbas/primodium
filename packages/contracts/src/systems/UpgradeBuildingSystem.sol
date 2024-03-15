// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { PositionData, Level } from "codegen/index.sol";
import { LibBuilding } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  /// @param coord Coordinate of the building to be upgraded
  /// @return buildingEntity Entity identifier of the upgraded building
  function upgradeBuilding(
    PositionData memory coord
  ) public _claimResources(coord.parent) returns (bytes32 buildingEntity) {
    // Check there isn't another tile there
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    LibBuilding.checkUpgradeRequirements(_player(), buildingEntity);

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    Level.set(buildingEntity, targetLevel);
    IWorld world = IWorld(_world());
    world.Primodium__increaseMaxStorage(buildingEntity, targetLevel);
    world.Primodium__upgradeProductionRate(buildingEntity, targetLevel);
    world.Primodium__spendBuildingRequiredResources(buildingEntity, targetLevel);
  }
}
