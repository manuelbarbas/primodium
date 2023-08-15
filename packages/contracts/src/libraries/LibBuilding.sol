// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "components/UnitProductionOwnedByComponent.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibTerrain } from "libraries/LibTerrain.sol";

// types
import { BuildingKey, ExpansionKey } from "../prototypes.sol";
import { Coord, Bounds, Dimensions } from "src/types.sol";

// Subsystems
import { EActionType, IOnBuildingSubsystem } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";
import { ID as PlaceBuildingTilesSystemID } from "systems/S_PlaceBuildingTilesSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "systems/S_SpendRequiredResourcesSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "systems/S_UpdateActiveStatusSystem.sol";
import { ID as UpdateOccupiedUtilitySystemID } from "systems/S_UpdateOccupiedUtilitySystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "systems/S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateRequiredProductionSystemID } from "systems/S_UpdateRequiredProductionSystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "systems/S_UpdateUtilityProductionSystem.sol";

library LibBuilding {
  function canBuildOnTile(IWorld world, uint256 buildingType, Coord memory coord) internal view returns (bool) {
    P_RequiredTileComponent requiredTileComponent = P_RequiredTileComponent(
      world.getComponent(P_RequiredTileComponentID)
    );
    return
      !requiredTileComponent.has(buildingType) ||
      requiredTileComponent.getValue(buildingType) == LibTerrain.getResourceByCoord(world, coord);
  }

  function getBaseLevel(IWorld world, uint256 playerEntity) internal view returns (uint32) {
    MainBaseComponent mainBaseComponent = MainBaseComponent(world.getComponent(MainBaseComponentID));

    if (!mainBaseComponent.has(playerEntity)) return 0;
    uint256 mainBase = mainBaseComponent.getValue(playerEntity);
    return LevelComponent(world.getComponent(LevelComponentID)).getValue(mainBase);
  }

  function getPlayerBounds(IWorld world, uint256 playerEntity) internal view returns (Bounds memory bounds) {
    uint32 playerLevel = LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(playerEntity);
    uint256 researchLevelEntity = LibEncode.hashKeyEntity(ExpansionKey, playerLevel);

    DimensionsComponent dimensionsComponent = DimensionsComponent(
      getAddressById(world.components(), DimensionsComponentID)
    );
    Dimensions memory asteroidDims = dimensionsComponent.getValue(SingletonID);
    Dimensions memory range = dimensionsComponent.getValue(researchLevelEntity);
    console.log(uint32(range.x), uint32(range.y));
    return
      Bounds({
        maxX: (asteroidDims.x / 2 + range.x / 2) - 1,
        maxY: (asteroidDims.y / 2 + range.y / 2) - 1,
        minX: (asteroidDims.x / 2 - range.x / 2),
        minY: (asteroidDims.y / 2 - range.y / 2)
      });
  }

  function build(IWorld world, uint256 buildingType, Coord memory coord) internal {
    uint256 playerEntity = addressToEntity(msg.sender);

    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).set(buildingEntity, buildingType);
    LevelComponent(world.getComponent(LevelComponentID)).set(buildingEntity, 1);
    PositionComponent(world.getComponent(PositionComponentID)).set(buildingEntity, coord);

    IOnEntitySubsystem(getAddressById(world.systems(), PlaceBuildingTilesSystemID)).executeTyped(
      msg.sender,
      buildingEntity
    );

    if (P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID)).has(buildingTypeLevelEntity)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, buildingTypeLevelEntity, 1),
        "[BuildSystem] You do not have the required resources"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        buildingTypeLevelEntity
      );
    }

    OwnedByComponent(world.getComponent(OwnedByComponentID)).set(buildingEntity, playerEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    //required production update
    if (
      P_ProductionDependenciesComponent(world.getComponent(P_ProductionDependenciesComponentID)).has(
        buildingLevelEntity
      )
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateRequiredProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    //Utility Production Update
    if (P_UtilityProductionComponent(world.getComponent(P_UtilityProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateUtilityProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }
    //Occupied Utility Update
    if (P_RequiredUtilityComponent(world.getComponent(P_RequiredUtilityComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedUtilitySystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }
    //Resource Storage Update
    if (P_MaxResourceStorageComponent(world.getComponent(P_MaxResourceStorageComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    if (P_UnitProductionTypesComponent(world.getComponent(P_UnitProductionTypesComponentID)).has(buildingLevelEntity)) {
      UnitProductionOwnedByComponent(world.getComponent(UnitProductionOwnedByComponentID)).set(
        buildingEntity,
        playerEntity
      );
      uint256[] memory unitTypes = P_UnitProductionTypesComponent(world.getComponent(P_UnitProductionTypesComponentID))
        .getValue(buildingLevelEntity);
      LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
      for (uint256 i = 0; i < unitTypes.length; i++) {
        uint256 playerUnitEntity = LibEncode.hashKeyEntity(unitTypes[i], playerEntity);
        if (!levelComponent.has(playerUnitEntity)) {
          levelComponent.set(playerUnitEntity, 1);
        }
      }
    }
  }
}
