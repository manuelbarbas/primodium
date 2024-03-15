// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IsActive, P_UnitProdTypes, Position, PositionData, BuildingType, OwnedBy, Level, BuildingType } from "codegen/index.sol";
import { LibBuilding, UnitFactorySet } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param coord Coordinate of the building to be destroyed
  /// @return buildingEntity Entity identifier of the destroyed building
  function destroy(PositionData memory coord) public _claimResources(coord.parent) returns (bytes32 buildingEntity) {
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    LibBuilding.checkDestroyRequirements(_player(), buildingEntity);

    IWorld world = IWorld(_world());
    world.Primodium__clearUtilityUsage(buildingEntity);
    world.Primodium__clearMaxStorageIncrease(buildingEntity);
    world.Primodium__clearProductionRate(buildingEntity);

    bytes32 buildingType = BuildingType.get(buildingEntity);

    uint256 level = Level.get(buildingEntity);

    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);
    IsActive.deleteRecord(buildingEntity);
    if (P_UnitProdTypes.length(buildingType, level) != 0) {
      UnitFactorySet.remove(coord.parent, buildingEntity);
    }

    LibBuilding.removeBuildingTiles(coord);

    return buildingEntity;
  }
}
