// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

// libraries
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";

// types
import { Coord } from "../types.sol";
import { MainBaseID, BuildingKey } from "../prototypes.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord memory coord) = abi.decode(args, (uint256, Coord));

    require(
      P_IsBuildingTypeComponent(getC(P_IsBuildingTypeComponentID)).has(buildingType),
      "[BuildSystem] Invalid building type"
    );

    PositionComponent positionComponent = PositionComponent(getC(PositionComponentID));
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);

    uint256 playerEntity = addressToEntity(msg.sender);
    bool spawned = positionComponent.has(playerEntity);
    require(spawned, "[BuildSystem] Player has not spawned");

    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);
    require(!positionComponent.has(buildingEntity), "[BuildSystem] Building already exists");

    require(
      coord.parent == positionComponent.getValue(playerEntity).parent,
      "[BuildSystem] Building must be built on your main asteroid"
    );

    require(
      LibResearch.hasResearched(world, buildingTypeLevelEntity, playerEntity),
      "[BuildSystem] You have not researched the required technology"
    );

    require(
      LibUtilityResource.checkUtilityResourceReqs(world, playerEntity, buildingType, 1),
      "[BuildSystem] You do not have the required Utility resources"
    );

    require(LibBuilding.canBuildOnTile(world, buildingType, coord), "[BuildSystem] Cannot build on this tile");

    require(buildingType != MainBaseID, "[BuildSystem] Cannot build more than one main base per wallet");

    LibBuilding.build(world, buildingType, coord);

    return abi.encode(buildingEntity);
  }
}
