// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_MaxLevel, BuildingType, PositionData, Level, P_MaxLevel, P_RequiredResources, OwnedBy } from "codegen/Tables.sol";
import { LibBuilding, LibResource, LibDependency, LibProduction } from "codegen/Libraries.sol";
import { EBuilding } from "codegen/Types.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  function upgradeBuilding(PositionData memory coord) public returns (bytes32 buildingEntity) {
    // Check there isn't another tile there
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeBuildingSystem] no building at this coordinate");

    uint32 targetLevel = Level.get(buildingEntity) + 1;
    require(targetLevel > 1, "[UpgradeBuildingSystem] Cannot upgrade a non-building");

    bytes32 playerEntity = addressToEntity(msg.sender);
    require(
      OwnedBy.get(buildingEntity) == playerEntity,
      "[UpgradeBuildingSystem] Cannot upgrade a building that is not owned by you"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint32 maxLevel = P_MaxLevel.get(buildingPrototype);
    require((targetLevel <= maxLevel), "[UpgradeBuildingSystem] Building has reached max level");

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, buildingPrototype, targetLevel),
      "[ResearchSystem] MainBase level requirement not met"
    );

    // PREV: checkRequiredResources, checkRequiredUtilities, spendRequiredResources, spendRequiredUtilities
    IWorld(_world()).spendRequiredResources(buildingPrototype, targetLevel);
    // PREV: updateRequiredProduction, checkResourceProductionRequirements
    LibDependency.increaseDependencyUsage(playerEntity, buildingPrototype, targetLevel);
    // PREV: updateRequiredProduction, checkResourceProductionRequirements
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, targetLevel);

    //update building level
    Level.set(buildingEntity, targetLevel);
  }
}
