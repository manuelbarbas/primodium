// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { Position, PositionData, Spawned, HomeAsteroid } from "codegen/Tables.sol";

// libraries
import { LibEncode, LibBuilding } from "libraries/Libraries.sol";

// types
import { BuildingKey } from "src/Keys.sol";
import { EBuilding } from "codegen/Types.sol";

contract BuildSystem is PrimodiumSystem {
  function execute(EBuilding buildingType, PositionData memory coord) public returns (bytes memory) {
    require(buildingType > EBuilding.NULL && buildingType < EBuilding.LENGTH, "[BuildSystem] Invalid building type");

    bytes32 playerEntity = addressToEntity(_msgSender());
    require(Spawned.get(playerEntity), "[BuildSystem] Player has not spawned");

    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    require(!Spawned.get(buildingEntity), "[BuildSystem] Building already exists");

    require(
      coord.parent == HomeAsteroid.get(playerEntity),
      "[BuildSystem] Building must be built on your home asteroid"
    );

    require(LibBuilding.canBuildOnTile(buildingType, coord), "[BuildSystem] Cannot build on this tile");

    // require(buildingType != MainBaseID, "[BuildSystem] Cannot build more than one main base per wallet");

    LibBuilding.build(playerEntity, buildingType, coord);

    return abi.encode(buildingEntity);
  }
}
