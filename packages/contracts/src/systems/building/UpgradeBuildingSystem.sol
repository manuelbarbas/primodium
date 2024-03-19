// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Position, PositionData, Level } from "codegen/index.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  function upgradeBuilding(bytes32 buildingEntity) public _claimResources(Position.getParentEntity(buildingEntity)) {
    LibBuilding.checkUpgradeRequirements(_player(), buildingEntity);

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    Level.set(buildingEntity, targetLevel);
    IWorld world = IWorld(_world());
    world.Primodium__increaseMaxStorage(buildingEntity, targetLevel);
    world.Primodium__upgradeProductionRate(buildingEntity, targetLevel);
    world.Primodium__spendBuildingRequiredResources(buildingEntity, targetLevel);
  }
}
