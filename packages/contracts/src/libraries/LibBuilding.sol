// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_MaxMovesComponent, ID as P_MaxMovesComponentID } from "components/P_MaxMovesComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "components/UnitProductionOwnedByComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { HasBuiltBuildingComponent, ID as HasBuiltBuildingComponentID } from "components/HasBuiltBuildingComponent.sol";
import { P_BuildingCountRequirementComponent, ID as P_BuildingCountRequirementComponentID } from "components/P_BuildingCountRequirementComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
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
import { ID as UpdateOccupiedUtilitySystemID } from "systems/S_UpdateOccupiedUtilitySystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "systems/S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "systems/S_UpdateUtilityProductionSystem.sol";
import { ID as S_UpdatePlayerResourceProductionSystemID } from "systems/S_UpdatePlayerResourceProductionSystem.sol";

library LibBuilding {
  function checkHasBuiltBuildingRequirement(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType
  ) internal view returns (bool) {
    return
      HasBuiltBuildingComponent(getAddressById(world.components(), HasBuiltBuildingComponentID)).has(
        LibEncode.hashKeyEntity(buildingType, playerEntity)
      );
  }

  function checkBuildingCountRequirement(
    IWorld world,
    uint256 playerEntity,
    uint256 objectiveEntity
  ) internal view returns (bool) {
    P_BuildingCountRequirementComponent buildingCountRequirementComponent = P_BuildingCountRequirementComponent(
      getAddressById(world.components(), P_BuildingCountRequirementComponentID)
    );
    if (!buildingCountRequirementComponent.has(objectiveEntity)) return true;

    ResourceValues memory buildingCountRequirement = buildingCountRequirementComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < buildingCountRequirement.resources.length; i++) {
      uint256 buildingType = buildingCountRequirement.resources[i];
      uint32 requiredBuildingCount = buildingCountRequirement.values[i];

      uint32 currBuildingCount = LibMath.getSafe(
        BuildingCountComponent(getAddressById(world.components(), BuildingCountComponentID)),
        LibEncode.hashKeyEntity(buildingType, playerEntity)
      );

      if (currBuildingCount < requiredBuildingCount) return false;
    }
    return true;
  }

  function checkMainBaseLevelRequirement(
    IWorld world,
    uint256 playerEntity,
    uint256 entity
  ) internal view returns (bool) {
    LevelComponent levelComponent = LevelComponent(getAddressById(world.components(), LevelComponentID));
    if (!levelComponent.has(entity)) return true;
    uint256 mainLevel = getBaseLevel(world, playerEntity);
    return mainLevel >= levelComponent.getValue(entity);
  }

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
    return
      Bounds({
        maxX: (asteroidDims.x + range.x) / 2 - 1,
        maxY: (asteroidDims.y + range.y) / 2 - 1,
        minX: (asteroidDims.x - range.x) / 2,
        minY: (asteroidDims.y - range.y) / 2
      });
  }

  function build(IWorld world, uint256 buildingType, Coord memory coord) internal {
    uint256 playerEntity = addressToEntity(msg.sender);

    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, 1);
    BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).set(buildingEntity, buildingType);
    LevelComponent(world.getComponent(LevelComponentID)).set(buildingEntity, 1);
    PositionComponent(world.getComponent(PositionComponentID)).set(buildingEntity, coord);
    LastClaimedAtComponent(world.getComponent(LastClaimedAtComponentID)).set(buildingEntity, block.number);

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

    // Starmapper Update
    if (P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).has(buildingLevelEntity)) {
      uint32 movesToAdd = P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).getValue(buildingLevelEntity);
      LibMath.add(MaxMovesComponent(world.getComponent(MaxMovesComponentID)), playerEntity, movesToAdd);
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
    }
    //Resource Production Update
    if (P_ProductionComponent(world.getComponent(P_ProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), S_UpdatePlayerResourceProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Build
      );
    }

    HasBuiltBuildingComponent(getAddressById(world.components(), HasBuiltBuildingComponentID)).set(
      LibEncode.hashKeyEntity(buildingType, playerEntity)
    );

    LibMath.add(
      BuildingCountComponent(getAddressById(world.components(), BuildingCountComponentID)),
      LibEncode.hashKeyEntity(buildingType, playerEntity),
      1
    );
    //required production update
    LibResource.updateRequiredProduction(world, playerEntity, buildingType, 1, true);
  }
}
