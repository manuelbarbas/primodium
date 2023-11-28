// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { PositionData, Level } from "codegen/index.sol";
import { LibBuilding } from "codegen/Libraries.sol";

import { addressToEntity } from "src/utils.sol";

contract ActivateBuildingSystem is PrimodiumSystem {
  /// @notice Upgrades the building at the specified coordinate
  /// @param coord Coordinate of the building to be upgraded
  /// @return buildingEntity Entity identifier of the upgraded building
  function ToggleBuilding(PositionData memory coord) public returns (bool isActive) {
    // Check there isn't another tile there
    bytes32 playerEntity = addressToEntity(_msgSender());
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    uint256 targetLevel = Level.get(buildingEntity) + 1;
    Level.set(buildingEntity, targetLevel);
  }
}
