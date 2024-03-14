// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { OwnedBy, BuildingType, Position, PositionData } from "codegen/index.sol";

// libraries
import { LibBuilding } from "codegen/Libraries.sol";
import { LibAsteroid } from "codegen/Libraries.sol";

contract MoveBuildingSystem is PrimodiumSystem {
  function moveBuilding(bytes32 buildingEntity, PositionData memory toCoord) public {
    bytes32 buildingAsteroid = Position.getParent(buildingEntity);
    toCoord.parent = buildingAsteroid;
    bytes32 playerEntity = _player();
    require(
      OwnedBy.get(buildingAsteroid) == playerEntity,
      "[MoveBuildingSystem] the rock which the building is on is not owned by the player"
    );
    bytes32 buildingType = BuildingType.get(buildingEntity);
    require(
      LibBuilding.canBuildOnTile(buildingType, toCoord),
      "[MoveBuildingSystem] the building cannot be placed on this resource"
    );
    LibBuilding.removeBuildingTiles(buildingEntity);
    Position.set(buildingEntity, toCoord);
    LibBuilding.placeBuildingTiles(buildingEntity, buildingType, toCoord);
  }
}
