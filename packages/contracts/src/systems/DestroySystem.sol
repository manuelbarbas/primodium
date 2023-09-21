// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { P_ProducesUnits, Position, PositionData, BuildingType, OwnedBy, Children, Spawned, Level, BuildingType } from "codegen/Tables.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { LibBuilding, LibReduceProductionRate, LibResource, LibProduction, LibStorage, UnitFactorySet } from "codegen/Libraries.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param coord Coordinate of the building to be destroyed
  /// @return buildingEntity Entity identifier of the destroyed building
  function destroy(PositionData memory coord) public returns (bytes32 buildingEntity) {
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    bytes32 playerEntity = addressToEntity(msg.sender);
    bytes32 buildingType = BuildingType.get(buildingEntity);
    IWorld world = IWorld(_world());
    require(buildingType != MainBasePrototypeId, "[Destroy] Cannot destroy main base");
    require(OwnedBy.get(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    bytes32[] memory children = Children.get(buildingEntity);
    for (uint256 i = 0; i < children.length; i++) {
      require(OwnedBy.get(children[i]) != 0, "[Destroy] Cannot destroy unowned coordinate");
      OwnedBy.deleteRecord(children[i]);
    }
    Children.deleteRecord(buildingEntity);

    world.clearProductionRateReduction(playerEntity, buildingEntity);
    LibResource.clearUtilityUsage(playerEntity, buildingEntity);
    LibProduction.clearResourceProduction(playerEntity, buildingEntity);
    LibStorage.clearMaxStorageIncrease(playerEntity, buildingEntity);

    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);

    if (P_ProducesUnits.get(buildingType)) {
      UnitFactorySet.remove(playerEntity, buildingEntity);
    }
  }
}
