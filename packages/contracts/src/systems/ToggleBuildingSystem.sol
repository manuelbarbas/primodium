// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { PositionData, Level } from "codegen/index.sol";
import { IsActive, Home, OwnedBy } from "src/codegen/index.sol";
import { LibBuilding, UnitProductionQueue } from "codegen/Libraries.sol";

contract ToggleBuildingSystem is PrimodiumSystem {
  /// @notice Toggles the building at the specified coordinate
  /// @param coord Coordinate of the building to be toggled
  /// @return isActive the new active status of the building
  function toggleBuilding(PositionData memory coord) public returns (bool isActive) {
    // Check there isn't another tile there
    bytes32 playerEntity = _player(false);
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    require(OwnedBy.get(coord.parent) == playerEntity, "[ToggleBuilding] Only owner can toggle building");
    require(buildingEntity != Home.getMainBase(playerEntity), "[ToggleBuilding] Can not toggle main base");
    require(
      UnitProductionQueue.isEmpty(buildingEntity),
      "[ToggleBuilding] Can not toggle building while it is training units"
    );
    isActive = !IsActive.get(buildingEntity);
    IsActive.set(buildingEntity, isActive);
  }
}
