// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IsActive, P_RawResource, Spawned, ConsumptionRate, OwnedBy, MaxResourceCount, ProducedUnit, ClaimOffset, BuildingType, ProductionRate, P_UnitProdTypes, P_MiningRate, P_RequiredResourcesData, P_RequiredResources, P_IsUtility, UnitCount, ResourceCount, Level, UnitLevel, Home, BuildingType, P_GameConfig, P_GameConfigData, P_Unit, P_UnitProdMultiplier, LastClaimedAt, P_EnumToPrototype } from "codegen/index.sol";

import { EUnit } from "src/Types.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibMath } from "libraries/LibMath.sol";
import { UnitProductionQueue, UnitProductionQueueData } from "libraries/UnitProductionQueue.sol";
import { UnitKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibUnit {
  function getUnitCountOnHomeAsteroid(bytes32 playerEntity, bytes32 unitType) internal view returns (uint256) {
    return UnitCount.get(Home.getAsteroid(playerEntity), unitType);
  }

  /**
   * @dev Checks the requirements for training (producing) a specific unit in a building.
   * @param buildingEntity The identifier of the building where the unit is being trained.
   * @param unit The type of unit to be trained.
   * @notice Checks if the unit exists and if the building can produce the specified unit.
   */
  function checkTrainUnitsRequirements(bytes32 buildingEntity, EUnit unit) internal view {
    require(IsActive.get(buildingEntity), "[TrainUnitsSystem] Can not train units using an in active building");

    // Ensure the unit is valid (within the defined range of unit types).
    require(unit > EUnit.NULL && unit < EUnit.LENGTH, "[TrainUnitsSystem] Unit does not exist");

    // Determine the prototype of the unit based on its unit key.
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    bytes32 buildingType = BuildingType.get(buildingEntity);

    uint256 level = Level.get(buildingEntity);
    // Check if the building can produce the specified unit based on its prototype.
    require(canProduceUnit(buildingType, level, unitPrototype), "[TrainUnitsSystem] Building cannot produce unit");
  }

  /// @notice Check if a building can produce a unit
  /// @param buildingEntity Entity ID of the building
  /// @param level Level of the building
  /// @param unitPrototype Unit prototype to check
  /// @return True if unit can be produced, false otherwise
  function canProduceUnit(
    bytes32 buildingEntity,
    uint256 level,
    bytes32 unitPrototype
  ) internal view returns (bool) {
    if (P_UnitProdTypes.length(buildingEntity, level) == 0) return false;
    bytes32[] memory unitTypes = P_UnitProdTypes.get(buildingEntity, level);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      if (unitTypes[i] == unitPrototype) return true;
    }
    return false;
  }

  /// @notice Claim units from all player's buildings
  /// @param spaceRockEntity Entity ID of the player
  function claimUnits(bytes32 spaceRockEntity) internal {
    // get all player buildings that can produce units
    bytes32[] memory buildings = UnitFactorySet.getAll(spaceRockEntity);
    for (uint256 i = 0; i < buildings.length; i++) {
      bytes32 building = buildings[i];
      claimBuildingUnits(building);
    }
  }

  /// @notice Claim units for a single building
  /// @param building Entity ID of the building
  function claimBuildingUnits(bytes32 building) internal {
    uint256 startTime = LastClaimedAt.get(building) - ClaimOffset.get(building);
    LastClaimedAt.set(building, block.timestamp);
    bytes32 playerEntity = OwnedBy.get(OwnedBy.get(building));
    require(Spawned.get(playerEntity), "[ClaimBuildingUnits]: Owner does not exist");
    bool stillClaiming = !UnitProductionQueue.isEmpty(building);
    while (stillClaiming) {
      UnitProductionQueueData memory item = UnitProductionQueue.peek(building);
      uint256 trainingTime = getUnitBuildTime(playerEntity, building, item.unitId);
      uint256 trainedUnits = item.quantity;
      if (trainingTime > 0) trainedUnits = LibMath.min(item.quantity, ((block.timestamp - startTime) / (trainingTime)));

      if (trainedUnits == 0) {
        ClaimOffset.set(building, (block.timestamp - startTime) % trainingTime);
        return;
      }
      if (trainedUnits == item.quantity) {
        UnitProductionQueue.dequeue(building);
        stillClaiming = !UnitProductionQueue.isEmpty(building);
        startTime += trainingTime * trainedUnits;
        if (!stillClaiming) ClaimOffset.set(building, 0);
      } else {
        item.quantity -= trainedUnits;
        UnitProductionQueue.updateFront(building, item);
        ClaimOffset.set(building, (block.timestamp - startTime) % trainingTime);
        stillClaiming = false;
      }
      ProducedUnit.set(playerEntity, item.unitId, ProducedUnit.get(playerEntity, item.unitId) + trainedUnits);
      increaseUnitCount(Home.getAsteroid(playerEntity), item.unitId, trainedUnits);
    }
  }

  /// @notice Get the build time for a unit
  /// @param playerEntity Entity ID of the player
  /// @param building Entity ID of the building
  /// @param unitPrototype Unit prototype to check
  /// @return Time in seconds
  function getUnitBuildTime(
    bytes32 playerEntity,
    bytes32 building,
    bytes32 unitPrototype
  ) internal view returns (uint256) {
    uint256 buildingLevel = Level.get(building);
    bytes32 buildingType = BuildingType.get(building);
    uint256 multiplier = P_UnitProdMultiplier.get(buildingType, buildingLevel);
    uint256 unitLevel = UnitLevel.get(playerEntity, unitPrototype);
    uint256 rawTrainingTime = P_Unit.getTrainingTime(unitPrototype, unitLevel);
    require(multiplier > 0, "Building has no unit production multiplier");
    P_GameConfigData memory config = P_GameConfig.get();
    return
      (rawTrainingTime * 100 * 100 * WORLD_SPEED_SCALE) / (multiplier * config.unitProductionRate * config.worldSpeed);
  }

  /**
   * @dev Updates the stored utility resources based on the addition or removal of units.
   * @param spaceRockEntity The identifier of the player.
   * @param unitType The type of unit.
   * @param count The number of units being added or removed.
   * @param add A boolean indicating whether units are being added (true) or removed (false).
   */
  function updateStoredUtilities(
    bytes32 spaceRockEntity,
    bytes32 unitType,
    uint256 count,
    bool add
  ) internal {
    if (count == 0) return;
    bytes32 playerEntity = OwnedBy.get(spaceRockEntity);
    uint256 unitLevel = UnitLevel.get(playerEntity, unitType);

    P_RequiredResourcesData memory resources = P_RequiredResources.get(unitType, unitLevel);
    for (uint8 i = 0; i < resources.resources.length; i++) {
      uint8 resource = resources.resources[i];
      if (!P_IsUtility.get(resource)) continue;
      uint256 requiredAmount = resources.amounts[i] * count;
      uint256 currentAmount = ResourceCount.get(spaceRockEntity, resource);

      if (add) {
        require(currentAmount >= requiredAmount, "[LibUnit] Not enough utility resources");
        ResourceCount.set(spaceRockEntity, resource, currentAmount - requiredAmount);
      } else {
        require(
          currentAmount + requiredAmount <= MaxResourceCount.get(spaceRockEntity, resource),
          "[LibUnit] Can't store more utility resources"
        );
        ResourceCount.set(spaceRockEntity, resource, currentAmount + requiredAmount);
      }
    }
  }

  /**
   * @dev Increases the count of a specific unit type for a player's rock entity.
   * @param rockEntity The identifier of the player's rock entity.
   * @param unitType The type of unit to increase.
   * @param unitCount The number of units to increase.
   */
  function increaseUnitCount(
    bytes32 rockEntity,
    bytes32 unitType,
    uint256 unitCount
  ) internal {
    bytes32 playerEntity = OwnedBy.get(rockEntity);
    if (unitCount == 0) return;
    uint256 prevUnitCount = UnitCount.get(rockEntity, unitType);
    UnitCount.set(rockEntity, unitType, prevUnitCount + unitCount);
  }

  /**
   * @dev Decreases the count of a specific unit type for a player's rock entity.
   * @param rockEntity The identifier of the player's rock entity.
   * @param unitType The type of unit to decrease.
   * @param unitCount The number of units to decrease.
   */
  function decreaseUnitCount(
    bytes32 rockEntity,
    bytes32 unitType,
    uint256 unitCount
  ) internal {
    bytes32 playerEntity = OwnedBy.get(rockEntity);
    if (unitCount == 0) return;
    uint256 currUnitCount = UnitCount.get(rockEntity, unitType);
    if (unitCount > currUnitCount) unitCount = currUnitCount;
    UnitCount.set(rockEntity, unitType, currUnitCount - unitCount);
  }
}
