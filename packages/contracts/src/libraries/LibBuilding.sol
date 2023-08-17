// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
// components
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_IgnoreBuildLimitComponent, ID as P_IgnoreBuildLimitComponentID } from "components/P_IgnoreBuildLimitComponent.sol";
import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "components/P_MaxBuildingsComponent.sol";
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
import { BuildingKey } from "../prototypes.sol";
import { Coord } from "src/types.sol";

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
  function isMaxBuildingsMet(IWorld world, uint256 playerEntity, uint256 buildingId) internal view returns (bool) {
    if (P_IgnoreBuildLimitComponent(world.getComponent(P_IgnoreBuildLimitComponentID)).has(buildingId)) return true;
    uint32 baseLevel = getBaseLevel(world, playerEntity);
    uint32 buildCountLimit = getMaxBuildingCount(world, baseLevel);
    uint32 buildingCount = getBuildingCount(world, playerEntity);
    return buildingCount < buildCountLimit;
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

  function getBuildingCount(IWorld world, uint256 playerEntity) internal view returns (uint32) {
    BuildingCountComponent maxBuildingsComponent = BuildingCountComponent(world.getComponent(BuildingCountComponentID));
    return LibMath.getSafe(maxBuildingsComponent, playerEntity);
  }

  function getMaxBuildingCount(IWorld world, uint256 baseLevel) internal view returns (uint32) {
    P_MaxBuildingsComponent maxBuildingsComponent = P_MaxBuildingsComponent(
      world.getComponent(P_MaxBuildingsComponentID)
    );
    if (maxBuildingsComponent.has(baseLevel)) return maxBuildingsComponent.getValue(baseLevel);
    else revert("Invalid Base Level");
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

    // update building count if the built building counts towards the build limit
    if (!P_IgnoreBuildLimitComponent(world.getComponent(P_IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingCountComponent buildingCountComponent = BuildingCountComponent(
        world.getComponent(BuildingCountComponentID)
      );
      buildingCountComponent.set(playerEntity, LibMath.getSafe(buildingCountComponent, playerEntity) + 1);
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
