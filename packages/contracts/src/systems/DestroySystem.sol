// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";

import { P_ProducesUnits, Position, PositionData, BuildingType, OwnedBy, Children, Spawned, Level, BuildingType } from "codegen/index.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { LibBuilding, LibReduceProductionRate, LibResource, LibProduction, LibStorage, UnitFactorySet } from "codegen/Libraries.sol";

import { console } from "forge-std/console.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param coord Coordinate of the building to be destroyed
  /// @return buildingEntity Entity identifier of the destroyed building
  function destroy(PositionData memory coord) public returns (bytes32 buildingEntity) {
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    bytes32 playerEntity = addressToEntity(msg.sender);
    bytes32 buildingType = BuildingType.get(buildingEntity);

    console.log("Destroying building %s", bytes32ToString(buildingEntity));
    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);

    if (P_ProducesUnits.get(buildingType)) {
      UnitFactorySet.remove(playerEntity, buildingEntity);
    }
    return buildingEntity;
  }
}
