// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import "forge-std/console.sol";
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
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { LibUtilityResource } from "./LibUtilityResource.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues, ResourceValue } from "../types.sol";
import { BIGNUM } from "../prototypes/Debug.sol";

library LibUnits {
  function updateOccuppiedUtilityResources(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType,
    uint32 count,
    bool isAdd
  ) internal {
    if (count == 0) return;

    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint32 unitLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, unitLevel);
    if (!requiredUtilityComponent.has(unitLevelEntity)) return;

    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(unitLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(unitLevelEntity).values;

    for (uint256 i = 0; i < resourceIDs.length; i++) {
      if (requiredAmounts[i] == 0) continue; // this is a hack to avoid division by zero (should be fixed in the future])
      uint32 requiredAmount = requiredAmounts[i] * count;
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);

      if (isAdd) {
        occupiedUtilityResourceComponent.set(
          playerResourceEntity,
          LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) + requiredAmount
        );
      } else if (requiredAmount <= LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity)) {
        occupiedUtilityResourceComponent.set(
          playerResourceEntity,
          LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) - requiredAmount
        );
      } else {
        occupiedUtilityResourceComponent.set(playerResourceEntity, 0);
      }
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
    console.log("getBuildingBuildTimeForUnit");
    uint256 buildingType = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).getValue(buildingEntity);
    console.log("buildingType", buildingType);
    uint32 buildingLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingEntity);
    console.log("buildingLevel", buildingLevel);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    console.log("buildingLevelEntity", buildingLevelEntity);
    uint32 buildingUnitProductionMultiplier = unitProductionMultiplierComponent.getValue(buildingLevelEntity);
    console.log("buildingUnitProductionMultiplier", buildingUnitProductionMultiplier);
    uint32 unitTrainingTime = (getUnitTrainingTime(world, playerEntity, unitType) * 100) /
      buildingUnitProductionMultiplier;
    console.log("unitTrainingTime", unitTrainingTime);
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
    uint32 unitLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
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

  function howManyUnitsCanAdd(IWorld world, uint256 playerEntity, uint256 unitType) internal view returns (uint32) {
    uint32 min = BIGNUM;
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint32 unitLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, unitLevel);
    if (!requiredUtilityComponent.has(unitLevelEntity)) return min; //this should be subtracted by current count of the unit type

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(unitLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(unitLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      if (requiredAmounts[i] == 0) continue; // this is a hack to avoid division by zero (should be fixed in the future
      uint32 count = LibUtilityResource.getAvailableUtilityCapacity(world, playerEntity, resourceIDs[i]) /
        requiredAmounts[i];
      if (count < min) min = count;
    }
    return min;
  }

  function getUnitCountOnRock(
    IWorld world,
    uint256 playerEntity,
    uint256 asteroidEntity,
    uint256 unitType
  ) internal view returns (uint32) {
    uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(unitType, playerEntity, asteroidEntity);
    return LibMath.getSafe(UnitsComponent(world.getComponent(UnitsComponentID)), unitPlayerSpaceRockEntity);
  }

  function getUnitTrainingTime(IWorld world, uint256 playerEntity, uint256 unitType) internal view returns (uint32) {
    P_UnitTrainingTimeComponent unitTrainingTimeComponent = P_UnitTrainingTimeComponent(
      world.getComponent(P_UnitTrainingTimeComponentID)
    );
    console.log("getUnitTrainingTime");
    uint32 unitTypeLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    console.log("unitTypeLevel", unitTypeLevel);
    return unitTrainingTimeComponent.getValue(LibEncode.hashKeyEntity(unitType, unitTypeLevel));
  }

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
