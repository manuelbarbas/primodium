// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as PostBuildSystemID } from "systems/PostBuildSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { MainBaseID, BuildingTileKey, BuildingKey } from "../prototypes.sol";

// libraries
import { Coord } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ID as SpendRequiredResourcesSystemID } from "./SpendRequiredResourcesSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./UpdatePlayerStorageSystem.sol";

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

    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    require(
      !ChildrenComponent(getC(ChildrenComponentID)).has(buildingEntity),
      "[BuildSystem] Building already exists here"
    );
    require(LibBuilding.canBuildOnTile(world, buildingType, coord), "[BuildSystem] Cannot build on this tile");
    require(
      LibResearch.hasResearched(world, buildingTypeLevelEntity, playerEntity),
      "[BuildSystem] You have not researched the required technology"
    );

    //check build limit
    require(
      LibBuilding.isMaxBuildingsMet(world, playerEntity, buildingType),
      "[BuildSystem] build limit reached. Upgrade main base or destroy buildings"
    );

    require(
      LibPassiveResource.checkPassiveResourceReqs(world, playerEntity, buildingType, 1),
      "[BuildSystem] You do not have the required passive resources"
    );

    //check resource requirements and if ok spend required resources

    if (
      RequiredResourcesComponent(getAddressById(components, RequiredResourcesComponentID)).has(buildingTypeLevelEntity)
    ) {
      require(
        LibResource.hasRequiredResources(world, buildingTypeLevelEntity, playerEntity),
        "[BuildSystem] You do not have the required resources"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        buildingTypeLevelEntity
      );
    }

    int32[] memory blueprint = BlueprintComponent(getC(BlueprintComponentID)).getValue(buildingType);
    uint256[] memory tiles = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1]);
      tiles[i / 2] = placeBuildingTile(buildingEntity, coord, relativeCoord);
    }
    ChildrenComponent(getC(ChildrenComponentID)).set(buildingEntity, tiles);
    //  MainBaseID has a special condition called MainBase, so that each wallet only has one MainBase
    if (buildingType == MainBaseID) {
      MainBaseComponent mainBaseComponent = MainBaseComponent(getC(MainBaseComponentID));

      if (mainBaseComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseComponent.set(playerEntity, buildingEntity);
      }
    }
    //set level of building to 1
    LevelComponent(getC(LevelComponentID)).set(buildingEntity, 1);
    BuildingTypeComponent(getC(BuildingTypeComponentID)).set(buildingEntity, buildingType);
    OwnedByComponent(getC(OwnedByComponentID)).set(buildingEntity, playerEntity);

    //required production update
    if (MinesComponent(getAddressById(components, MinesComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateRequiredProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }

    //Resource Production Update
    if (
      BuildingProductionComponent(getAddressById(components, BuildingProductionComponentID)).has(buildingLevelEntity)
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateActiveStatusSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    //Passive Production Update
    if (PassiveProductionComponent(getC(PassiveProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePassiveProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }
    //Occupied Passive Update
    if (RequiredPassiveComponent(getC(RequiredPassiveComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedPassiveSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }
    //Resource Storage Update
    if (
      MaxResourceStorageComponent(getC(MaxResourceStorageComponentID)).has(LibEncode.hashKeyEntity(buildingType, 1))
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    // update building count if the built building counts towards the build limit
    if (!IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingCountComponent buildingCountComponent = BuildingCountComponent(getC(BuildingCountComponentID));
      buildingCountComponent.set(playerEntity, LibMath.getSafe(buildingCountComponent, playerEntity) + 1);
    }

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
