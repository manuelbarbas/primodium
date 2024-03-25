// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IsActive, P_UnitProdTypes, Position, BuildingType, OwnedBy, Level, BuildingType } from "codegen/index.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { IWorld } from "codegen/world/IWorld.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param buildingEntity entity of the building to be destroyed
  function destroy(bytes32 buildingEntity) public _claimResources(Position.getParentEntity(buildingEntity)) {
    LibBuilding.checkDestroyRequirements(_player(), buildingEntity);

    IWorld world = IWorld(_world());
    world.Primodium__clearUtilityUsage(buildingEntity);
    world.Primodium__clearMaxStorageIncrease(buildingEntity);
    world.Primodium__clearProductionRate(buildingEntity);

    bytes32 buildingType = BuildingType.get(buildingEntity);

    uint256 level = Level.get(buildingEntity);

    LibBuilding.removeBuildingTiles(buildingEntity);

    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);
    IsActive.deleteRecord(buildingEntity);
    if (P_UnitProdTypes.length(buildingType, level) != 0) {
      UnitFactorySet.remove(OwnedBy.get(buildingEntity), buildingEntity);
    }
  }
}
