// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";

// tables
import { P_EnumToPrototype, Position, PositionData, Spawned, Home } from "codegen/Tables.sol";

// libraries
import { LibEncode, LibBuilding, LibResource } from "codegen/Libraries.sol";

// types
import { BuildingKey } from "src/Keys.sol";
import { EBuilding } from "src/Types.sol";

contract BuildSystem is PrimodiumSystem {
  function build(EBuilding buildingType, PositionData memory coord) public returns (bytes32 buildingEntity) {
    require(buildingType > EBuilding.NULL && buildingType < EBuilding.LENGTH, "[BuildSystem] Invalid building type");
    require(buildingType != EBuilding.MainBase, "[BuildSystem] Cannot build more than one main base per wallet");

    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(buildingType));
    require(Spawned.get(playerEntity), "[BuildSystem] Player has not spawned");

    buildingEntity = LibEncode.getHash(BuildingKey, coord);
    require(!Spawned.get(buildingEntity), "[BuildSystem] Building already exists");

    require(
      coord.parent == HomeAsteroid.get(playerEntity),
      "[BuildSystem] Building must be built on your home asteroid"
    );

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, buildingPrototype, 1),
      "[BuildSystem] MainBase level requirement not met"
    );

    require(LibBuilding.canBuildOnTile(buildingPrototype, coord), "[BuildSystem] Cannot build on this tile");

    // This system combines functionality of checkRequiredResources, checkRequiredUtilities, spendRequiredResources, and spendRequiredUtilities
    IWorld(_world()).spendRequiredResources(buildingPrototype, 1);

    LibBuilding.build(playerEntity, buildingPrototype, coord);
  }
}
