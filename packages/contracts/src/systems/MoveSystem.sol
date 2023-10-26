// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { BuildingType, HasBuiltBuilding, P_EnumToPrototype, Position, PositionData, Spawned, Home } from "codegen/index.sol";

// libraries
import { LibEncode, LibBuilding, LibResource } from "codegen/Libraries.sol";

// types
import { BuildingKey } from "src/Keys.sol";
import { EBuilding } from "src/Types.sol";
import { bytes32ToString } from "src/utils.sol";

contract MoveSystem is PrimodiumSystem {
  function move(PositionData memory fromCoord, PositionData memory toCoord) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(fromCoord);
    bytes32 buildingType = BuildingType.get(buildingEntity);
    require(
      LibBuilding.canBuildOnTile(buildingType, toCoord),
      "[MoveSystem] the building cannot be moved to the specified coordinates"
    );
    LibBuilding.removeBuildingTiles(fromCoord);
    LibBuilding.placeBuildingTiles(buildingEntity, buildingType, toCoord);
  }
}
