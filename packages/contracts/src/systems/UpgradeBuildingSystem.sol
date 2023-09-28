// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_MaxLevel, BuildingType, PositionData, Level, P_MaxLevel, P_RequiredResources, OwnedBy } from "codegen/index.sol";
import { LibBuilding, LibResource, LibReduceProductionRate, LibProduction, LibStorage } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { S_SpendResourcesSystem } from "systems/subsystems/S_SpendResourcesSystem.sol";
import { S_ReduceProductionRateSystem } from "systems/subsystems/S_ReduceProductionRateSystem.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  /// @param coord Coordinate of the building to be upgraded
  /// @return buildingEntity Entity identifier of the upgraded building
  function upgradeBuilding(PositionData memory coord) public returns (bytes32 buildingEntity) {
    // Check there isn't another tile there
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeBuildingSystem] no building at this coordinate");

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    require(targetLevel > 1, "[UpgradeBuildingSystem] Cannot upgrade a non-building");

    bytes32 playerEntity = addressToEntity(msg.sender);
    require(
      OwnedBy.get(buildingEntity) == playerEntity,
      "[UpgradeBuildingSystem] Cannot upgrade a building that is not owned by you"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint256 maxLevel = P_MaxLevel.get(buildingPrototype);
    require((targetLevel <= maxLevel), "[UpgradeBuildingSystem] Building has reached max level");

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, buildingPrototype, targetLevel),
      "[UpgradeBuildingSystem] MainBase level requirement not met"
    );

    Level.set(buildingEntity, targetLevel);

    SystemCall.callWithHooksOrRevert(
      entityToAddress(playerEntity),
      getSystemResourceId("S_ReduceProductionRateSystem"),
      abi.encodeCall(S_ReduceProductionRateSystem.reduceProductionRate, (playerEntity, buildingEntity, targetLevel)),
      0
    );

    SystemCall.callWithHooksOrRevert(
      entityToAddress(playerEntity),
      getSystemResourceId("S_SpendResourcesSystem"),
      abi.encodeCall(S_SpendResourcesSystem.spendBuildingRequiredResources, (buildingEntity, targetLevel)),
      0
    );

    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, targetLevel);
    LibStorage.increaseMaxStorage(playerEntity, buildingEntity, targetLevel);
  }
}
