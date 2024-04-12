// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Position, IsActive, OwnedBy, BuildingType } from "src/codegen/index.sol";
import { UnitProductionQueue } from "libraries/UnitProductionQueue.sol";

import { MainBasePrototypeId, WormholeBasePrototypeId } from "codegen/Prototypes.sol";

import { IWorld } from "codegen/world/IWorld.sol";

contract ToggleBuildingSystem is PrimodiumSystem {
  /// @notice Toggles the building at the specified coordinate
  /// @param buildingEntity the building to be toggled
  /// @return isActive the new active status of the building
  function toggleBuilding(
    bytes32 buildingEntity
  )
    public
    _claimResources(Position.getParentEntity(buildingEntity))
    _claimUnits(Position.getParentEntity(buildingEntity))
    returns (bool isActive)
  {
    // Check there isn't another tile there
    bytes32 playerEntity = _player();
    require(
      OwnedBy.get(Position.getParentEntity(buildingEntity)) == playerEntity,
      "[ToggleBuilding] Only owner can toggle building"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    require(
      buildingPrototype != MainBasePrototypeId && buildingPrototype != WormholeBasePrototypeId,
      "[ToggleBuilding] Can not toggle main base"
    );

    require(
      UnitProductionQueue.isEmpty(buildingEntity),
      "[ToggleBuilding] Can not toggle building while it is training units"
    );
    isActive = !IsActive.get(buildingEntity);
    IsActive.set(buildingEntity, isActive);

    IWorld world = IWorld(_world());
    world.Primodium__toggleMaxStorage(buildingEntity);
    world.Primodium__toggleProductionRate(buildingEntity);
    world.Primodium__toggleBuildingUtility(buildingEntity);
  }
}
