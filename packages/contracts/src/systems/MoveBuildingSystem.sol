// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { OwnedBy, BuildingType, HasBuiltBuilding, P_EnumToPrototype, Position, PositionData, Spawned, Home } from "codegen/index.sol";

// libraries
import { LibEncode, LibBuilding, LibResource } from "codegen/Libraries.sol";

contract MoveBuildingSystem is PrimodiumSystem {
  function moveBuilding(PositionData memory fromCoord, PositionData memory toCoord) public {
    toCoord.parent = fromCoord.parent;
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(fromCoord);
    require(
      OwnedBy.get(buildingEntity) == playerEntity,
      "[MoveBuildingSystem] the building is not owned by the player"
    );
    bytes32 buildingType = BuildingType.get(buildingEntity);
    require(
      LibBuilding.canBuildOnTile(buildingType, toCoord),
      "[MoveBuildingSystem] the building cannot be placed on this resource"
    );
    LibBuilding.removeBuildingTiles(fromCoord);
    Position.set(buildingEntity, toCoord);
    LibBuilding.placeBuildingTiles(playerEntity, buildingEntity, buildingType, toCoord);
  }
}
