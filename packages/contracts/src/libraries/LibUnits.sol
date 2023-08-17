// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { P_UnitTrainingTimeComponent, ID as P_UnitTrainingTimeComponentID } from "components/P_UnitTrainingTimeComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { P_UnitProductionMultiplierComponent, ID as P_UnitProductionMultiplierComponentID } from "components/P_UnitProductionMultiplierComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "components/UnitProductionLastQueueIndexComponent.sol";

import { LibUtilityResource } from "./LibUtilityResource.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues, ResourceValue } from "../types.sol";

library LibUnits {
  function updateOccuppiedUtilityResources(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType,
    uint32 count,
    bool isAdd
  ) internal {
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint32 unitLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(
      LibEncode.hashKeyEntity(unitType, playerEntity)
    );
    uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, unitLevel);
    if (!requiredUtilityComponent.has(unitLevelEntity)) return;

    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(unitLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(unitLevelEntity).values;

    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint32 requiredAmount = requiredAmounts[i] * count;
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
      occupiedUtilityResourceComponent.set(
        playerResourceEntity,
        isAdd
          ? LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) + requiredAmount
          : LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) - requiredAmount
      );
    }
  }

  function getBuildingBuildTimeForUnit(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingEntity,
    uint256 unitType
  ) internal view returns (uint32) {
    P_UnitProductionMultiplierComponent unitProductionMultiplierComponent = P_UnitProductionMultiplierComponent(
      world.getComponent(P_UnitProductionMultiplierComponentID)
    );
    uint256 buildingType = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).getValue(buildingEntity);
    uint32 buildingLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    uint32 buildingUnitProductionMultiplier = unitProductionMultiplierComponent.getValue(buildingLevelEntity);
    uint32 unitTrainingTime = (getUnitTrainingTime(world, playerEntity, unitType) * 100) /
      buildingUnitProductionMultiplier;
    return unitTrainingTime;
  }

  function canBuildingProduceUnit(IWorld world, uint256 buildingEntity, uint256 unitType) internal view returns (bool) {
    P_UnitProductionTypesComponent unitProductionTypesComponent = P_UnitProductionTypesComponent(
      world.getComponent(P_UnitProductionTypesComponentID)
    );
    uint256 buildingType = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).getValue(buildingEntity);
    uint32 buildingLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!unitProductionTypesComponent.has(buildingLevelEntity)) return false;
    uint256[] memory unitTypes = unitProductionTypesComponent.getValue(buildingLevelEntity);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      if (unitTypes[i] == unitType) {
        return true;
      }
    }
    return false;
  }

  function checkUtilityResourceReqs(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType,
    uint32 count
  ) internal view returns (bool) {
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint32 unitLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(
      LibEncode.hashKeyEntity(unitType, playerEntity)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(unitType, unitLevel);
    if (!requiredUtilityComponent.has(buildingLevelEntity)) return true;

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint32 requiredAmount = requiredAmounts[i] * count;
      if (LibUtilityResource.getAvailableUtilityCapacity(world, playerEntity, resourceIDs[i]) < requiredAmount) {
        return false;
      }
    }
    return true;
  }

  function getUnitTrainingTime(IWorld world, uint256 playerEntity, uint256 unitType) internal view returns (uint32) {
    P_UnitTrainingTimeComponent unitTrainingTimeComponent = P_UnitTrainingTimeComponent(
      world.getComponent(P_UnitTrainingTimeComponentID)
    );
    uint32 unitTypeLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    return unitTrainingTimeComponent.getValue(LibEncode.hashKeyEntity(unitType, unitTypeLevel));
  }

  //checks all required conditions for a factory to be functional and updates factory is functional status
  function getPlayerUnitTypeLevel(IWorld world, uint256 playerEntity, uint256 unitType) internal view returns (uint32) {
    uint256 playerUnitEntity = LibEncode.hashKeyEntity(unitType, playerEntity);
    return LibMath.getSafe(LevelComponent(world.getComponent(LevelComponentID)), playerUnitEntity);
  }

  function getUnitResourceCosts(
    IWorld world,
    uint256 unitType,
    uint256 playerEntity
  ) internal view returns (ResourceValues memory) {
    uint256 playerUnitLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, playerUnitLevel);
    return P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID)).getValue(unitLevelEntity);
  }
}
