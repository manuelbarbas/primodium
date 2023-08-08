// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { P_IgnoreBuildLimitComponent, ID as P_IgnoreBuildLimitComponentID } from "components/P_IgnoreBuildLimitComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";

import { MainBaseID, BuildingKey } from "../prototypes.sol";
// libraries
import { Coord } from "../types.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";
import { ID as CheckRequiredTileSystemID } from "./S_CheckRequiredTileSystem.sol";
import { ID as PlaceBuildingTilesSystemID } from "./S_PlaceBuildingTilesSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateRequiredProductionSystemID } from "./S_UpdateRequiredProductionSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./S_UpdateActiveStatusSystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "./S_UpdateUtilityProductionSystem.sol";
import { ID as UpdateOccupiedUtilitySystemID } from "./S_UpdateOccupiedUtilitySystem.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);
    uint256 playerEntity = addressToEntity(msg.sender);

    PositionComponent positionComponent = PositionComponent(getC(PositionComponentID));
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    bool spawned = positionComponent.has(playerEntity);
    require(spawned, "[BuildSystem] Player has not spawned");
    require(!positionComponent.has(buildingEntity), "[BuildSystem] Building already exists");

    require(
      coord.parent == positionComponent.getValue(playerEntity).parent,
      "[BuildSystem] Building must be built on your main asteroid"
    );
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
      LibUtilityResource.checkUtilityResourceReqs(world, playerEntity, buildingType, 1),
      "[BuildSystem] You do not have the required Utility resources"
    );

    //check resource requirements and if ok spend required resources

    if (P_RequiredResourcesComponent(getC(P_RequiredResourcesComponentID)).has(buildingTypeLevelEntity)) {
      require(
        LibResource.hasRequiredResources(world, buildingTypeLevelEntity, playerEntity),
        "[BuildSystem] You do not have the required resources"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        buildingTypeLevelEntity
      );
    }

    BuildingTypeComponent(getC(BuildingTypeComponentID)).set(buildingEntity, buildingType);
    LevelComponent(getC(LevelComponentID)).set(buildingEntity, 1);
    PositionComponent(getC(PositionComponentID)).set(buildingEntity, coord);
    bool canBuildOn = abi.decode(
      IOnTwoEntitySubsystem(getAddressById(world.systems(), CheckRequiredTileSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        buildingType
      ),
      (bool)
    );

    require(canBuildOn, "[BuildSystem] Cannot build on this tile");
    //  MainBaseID has a special condition called MainBase, so that each wallet only has one MainBase
    if (buildingType == MainBaseID) {
      MainBaseComponent mainBaseComponent = MainBaseComponent(getC(MainBaseComponentID));

      if (mainBaseComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseComponent.set(playerEntity, buildingEntity);
      }
    }

    IOnEntitySubsystem(getAddressById(world.systems(), PlaceBuildingTilesSystemID)).executeTyped(
      msg.sender,
      buildingEntity
    );

    OwnedByComponent(getC(OwnedByComponentID)).set(buildingEntity, playerEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    //required production update
    if (P_ProductionDependenciesComponent(getC(P_ProductionDependenciesComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateRequiredProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    //Utility Production Update
    if (P_UtilityProductionComponent(getC(P_UtilityProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateUtilityProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }
    //Occupied Utility Update
    if (P_RequiredUtilityComponent(getC(P_RequiredUtilityComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedUtilitySystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }
    //Resource Storage Update
    if (P_MaxResourceStorageComponent(getC(P_MaxResourceStorageComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    // update building count if the built building counts towards the build limit
    if (!P_IgnoreBuildLimitComponent(getC(P_IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingCountComponent buildingCountComponent = BuildingCountComponent(getC(BuildingCountComponentID));
      buildingCountComponent.set(playerEntity, LibMath.getSafe(buildingCountComponent, playerEntity) + 1);
    }

    return abi.encode(buildingEntity);
  }
}
