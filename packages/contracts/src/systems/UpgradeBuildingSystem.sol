// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Position, PositionData, Level } from "codegen/index.sol";
import { LibBuilding } from "codegen/Libraries.sol";
import { increaseMaxStorage, upgradeProductionRate, spendBuildingRequiredResources } from "libraries/SubsystemCalls.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  function upgradeBuilding(bytes32 buildingEntity) public _claimResources(Position.getParent(buildingEntity)) {
    LibBuilding.checkUpgradeRequirements(_player(), buildingEntity);

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    Level.set(buildingEntity, targetLevel);

    increaseMaxStorage(buildingEntity, targetLevel);
    upgradeProductionRate(buildingEntity, targetLevel);
    spendBuildingRequiredResources(buildingEntity, targetLevel);
  }
}
