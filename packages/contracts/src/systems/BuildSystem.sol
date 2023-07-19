// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as PostBuildSystemID } from "systems/PostBuildSystem.sol";

// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

import { BuildingTileKey, BuildingKey } from "../prototypes/Keys.sol";

// libraries
import { Coord } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord memory coord) = abi.decode(args, (uint256, Coord));

    uint256 buildingEntity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    uint256 playerEntity = addressToEntity(msg.sender);
    require(
      !BuildingTilesComponent(getC(BuildingTilesComponentID)).has(buildingEntity),
      "[BuildSystem] Cannot build a building with tiles"
    );
    require(LibBuilding.canBuildOnTile(world, buildingType, coord), "[BuildSystem] Cannot build on this tile");
    require(
      LibResearch.hasResearched(world, buildingType, playerEntity),
      "[BuildSystem] You have not researched the required technology"
    );

    require(
      LibResourceCost.hasRequiredResources(world, buildingType, playerEntity),
      "[BuildSystem] You do not have the required resources"
    );
    //check build limit
    require(
      LibBuilding.isBuildingLimitConditionMet(world, playerEntity, buildingType),
      "[BuildSystem] build limit reached. Upgrade main base or destroy buildings"
    );

    int32[] memory blueprint = BlueprintComponent(getC(BlueprintComponentID)).getValue(buildingType);
    uint256[] memory tiles = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1]);
      tiles[i / 2] = placeBuildingTile(buildingEntity, coord, relativeCoord);
    }
    BuildingTilesComponent(getC(BuildingTilesComponentID)).set(buildingEntity, tiles);
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(getC(BuildingLevelComponentID));
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (buildingType == MainBaseID) {
      buildingLevelComponent.set(playerEntity, buildingEntity);
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(playerEntity, buildingEntity);
      }
    }
    require(
      LibPassiveResource.checkPassiveResourceRequirements(world, playerEntity, buildingType),
      "[BuildSystem] You do not have the required passive resources"
    );

    //check resource requirements and if ok spend required resources
    LibResourceCost.spendRequiredResources(world, buildingType, playerEntity);

    //set level of building to 1
    buildingLevelComponent.set(buildingEntity, 1);
    TileComponent(getC(TileComponentID)).set(buildingEntity, buildingType);
    OwnedByComponent(getC(OwnedByComponentID)).set(buildingEntity, playerEntity);

    IOnEntitySubsystem(getAddressById(world.systems(), PostBuildSystemID)).executeTyped(msg.sender, buildingEntity);

    return abi.encode(buildingEntity);
  }

  function placeBuildingTile(
    uint256 buildingEntity,
    Coord memory baseCoord,
    Coord memory relativeCoord
  ) private returns (uint256 tileEntity) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    Coord memory coord = Coord(baseCoord.x + relativeCoord.x, baseCoord.y + relativeCoord.y);
    tileEntity = LibEncode.encodeCoordEntity(coord, BuildingTileKey);
    require(!ownedByComponent.has(tileEntity), "[BuildSystem] Cannot build tile on a non-empty coordinate");
    ownedByComponent.set(tileEntity, buildingEntity);
  }
}
