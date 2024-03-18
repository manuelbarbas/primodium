// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Position, PositionData, Level } from "codegen/index.sol";
import { IsActive, Home, OwnedBy, BuildingType } from "src/codegen/index.sol";
import { LibBuilding, UnitProductionQueue } from "codegen/Libraries.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { toggleMaxStorage, toggleProductionRate, toggleBuildingUtility } from "libraries/SubsystemCalls.sol";

contract ToggleBuildingSystem is PrimodiumSystem {
  /// @notice Toggles the building at the specified coordinate
  /// @param buildingEntity the building to be toggled
  /// @return isActive the new active status of the building
  function toggleBuilding(
    bytes32 buildingEntity
  )
    public
    _claimResources(Position.getParent(buildingEntity))
    _claimUnits(Position.getParent(buildingEntity))
    returns (bool isActive)
  {
    // Check there isn't another tile there
    bytes32 playerEntity = _player();
    require(
      OwnedBy.get(Position.getParent(buildingEntity)) == playerEntity,
      "[ToggleBuilding] Only owner can toggle building"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    require(buildingPrototype != MainBasePrototypeId, "[ToggleBuilding] Can not toggle main base");

    require(
      UnitProductionQueue.isEmpty(buildingEntity),
      "[ToggleBuilding] Can not toggle building while it is training units"
    );
    isActive = !IsActive.get(buildingEntity);
    IsActive.set(buildingEntity, isActive);

    toggleMaxStorage(buildingEntity);
    toggleProductionRate(buildingEntity);
    toggleBuildingUtility(buildingEntity);
  }
}
