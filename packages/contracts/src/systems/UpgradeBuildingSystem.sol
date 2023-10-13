// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_MaxLevel, BuildingType, PositionData, Level, P_MaxLevel, P_RequiredResources, OwnedBy } from "codegen/index.sol";
import { LibBuilding, LibResource, LibReduceProductionRate, LibProduction, LibStorage } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

contract UpgradeBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  /// @param coord Coordinate of the building to be upgraded
  /// @return buildingEntity Entity identifier of the upgraded building
  function upgradeBuilding(PositionData memory coord) public returns (bytes32 buildingEntity) {
    // Check there isn't another tile there
    bytes32 playerEntity = addressToEntity(_msgSender());
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    uint256 targetLevel = Level.get(buildingEntity) + 1;
    Level.set(buildingEntity, targetLevel);
  }
}
