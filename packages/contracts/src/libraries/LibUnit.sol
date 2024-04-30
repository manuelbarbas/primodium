// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Position, Asteroid, IsActive, OwnedBy, MaxResourceCount, ClaimOffset, BuildingType, P_UnitProdTypes, P_RequiredResourcesData, P_RequiredResources, P_IsUtility, UnitCount, ResourceCount, Level, UnitLevel, BuildingType, P_GameConfig, P_GameConfigData, P_Unit, P_UnitProdMultiplier, LastClaimedAt, MaxColonySlots, ColonyShipsInTraining } from "codegen/index.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { EResource } from "src/Types.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibMath } from "libraries/LibMath.sol";
import { UnitProductionQueue, UnitProductionQueueData } from "libraries/UnitProductionQueue.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";
import { LibColony } from "libraries/LibColony.sol";

library LibUnit {
  /**
   * @dev Checks the requirements for training (producing) a specific unit in a building.
   * @param buildingEntity The identifier of the building where the unit is being trained.
   * @param unitPrototype The type of unit to be trained.
   * @notice Checks if the unit exists and if the building can produce the specified unit.
   */
  function checkTrainUnitsRequirements(bytes32 buildingEntity, bytes32 unitPrototype) internal view {
    require(IsActive.get(buildingEntity), "[TrainUnitsSystem] Can not train units using an inactive building");
    require(
      unitPrototype != ColonyShipPrototypeId || UnitProductionQueue.size(buildingEntity) == 0,
      "[TrainUnitsSystem] Cannot train more than one colony ship at a time"
    );

    // Determine the prototype of the unit based on its unit key.
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
  function canProduceUnit(bytes32 buildingEntity, uint256 level, bytes32 unitPrototype) internal view returns (bool) {
    if (P_UnitProdTypes.length(buildingEntity, level) == 0) return false;
    bytes32[] memory unitTypes = P_UnitProdTypes.get(buildingEntity, level);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      if (unitTypes[i] == unitPrototype) return true;
    }
    return false;
  }

  /// @notice Claim units from all player's buildings
  /// @param asteroidEntity Entity ID of the player
  function claimUnits(bytes32 asteroidEntity) internal {
    // get all player buildings that can produce units
    bytes32[] memory buildings = UnitFactorySet.getAll(asteroidEntity);
    for (uint256 i = 0; i < buildings.length; i++) {
      bytes32 buildingEntity = buildings[i];
      claimBuildingUnits(buildingEntity);
    }
  }

  /// @notice Claim units for a single building
  /// @param buildingEntity Entity ID of the building
  function claimBuildingUnits(bytes32 buildingEntity) internal {
    uint256 startTime = LastClaimedAt.get(buildingEntity) - ClaimOffset.get(buildingEntity);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    require(Asteroid.getIsAsteroid(asteroidEntity), "[ClaimBuildingUnits]: Asteroid does not exist");
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);
    bool stillClaiming = !UnitProductionQueue.isEmpty(buildingEntity);
    while (stillClaiming) {
      UnitProductionQueueData memory item = UnitProductionQueue.peek(buildingEntity);
      uint256 trainingTime = getUnitBuildTime(buildingEntity, item.unitEntity);
      uint256 trainedUnits = item.quantity;
      if (trainingTime > 0) trainedUnits = LibMath.min(item.quantity, ((block.timestamp - startTime) / (trainingTime)));

      if (trainedUnits == 0) {
        ClaimOffset.set(buildingEntity, (block.timestamp - startTime) % trainingTime);
        return;
      }
      if (trainedUnits == item.quantity) {
        UnitProductionQueue.dequeue(buildingEntity);
        stillClaiming = !UnitProductionQueue.isEmpty(buildingEntity);
        startTime += trainingTime * trainedUnits;
        if (!stillClaiming) ClaimOffset.set(buildingEntity, 0);
      } else {
        item.quantity -= trainedUnits;
        UnitProductionQueue.updateFront(buildingEntity, item);
        ClaimOffset.set(buildingEntity, (block.timestamp - startTime) % trainingTime);
        stillClaiming = false;
      }

      if (item.unitEntity == ColonyShipPrototypeId) {
        uint256 asteroidTrainingShipCount = ColonyShipsInTraining.get(asteroidEntity);

        if (asteroidTrainingShipCount < trainedUnits) {
          // Some previous error has happened such that there are more colony ships being trained than available slots, so we need to mitigate this back to a valid state. Player unlikely to claim a colony ship in this state.
          trainedUnits = asteroidTrainingShipCount;
        }
        ColonyShipsInTraining.set(asteroidEntity, asteroidTrainingShipCount - trainedUnits);
      }

      increaseUnitCount(asteroidEntity, item.unitEntity, trainedUnits, false);
    }
  }

  /// @notice Get the build time for a unit
  /// @param buildingEntity Entity ID of the building
  /// @param unitPrototype Unit prototype to check
  /// @return Time in seconds
  function getUnitBuildTime(bytes32 buildingEntity, bytes32 unitPrototype) internal view returns (uint256) {
    uint256 buildingLevel = Level.get(buildingEntity);
    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint256 multiplier = P_UnitProdMultiplier.get(buildingType, buildingLevel);
    uint256 unitLevel = UnitLevel.get(Position.getParentEntity(buildingEntity), unitPrototype);
    uint256 rawTrainingTime = P_Unit.getTrainingTime(unitPrototype, unitLevel);
    require(multiplier > 0, "Building has no unit production multiplier");
    P_GameConfigData memory config = P_GameConfig.get();
    return
      (rawTrainingTime * 100 * 100 * WORLD_SPEED_SCALE) / (multiplier * config.unitProductionRate * config.worldSpeed);
  }

  /**
   * @dev Updates the stored utility resources based on the addition or removal of units.
   * @param asteroidEntity The identifier of the player.
   * @param unitType The type of unit.
   * @param count The number of units being added or removed.
   * @param add A boolean indicating whether units are being added (true) or removed (false).
   */
  function updateStoredUtilities(bytes32 asteroidEntity, bytes32 unitType, uint256 count, bool add) internal {
    if (count == 0) return;
    uint256 unitLevel = UnitLevel.get(asteroidEntity, unitType);

    // Check the player's colony slot maxColonySlots
    if (add && (unitType == ColonyShipPrototypeId)) {
      bytes32 playerEntity = OwnedBy.get(asteroidEntity);
      uint256 occupiedSlots = LibColony.getColonyShipsPlusAsteroids(playerEntity);
      uint256 maxColonySlots = MaxColonySlots.get(playerEntity);
      require(occupiedSlots + count <= maxColonySlots, "[LibUnit] Not enough colony slots");
    }

    P_RequiredResourcesData memory resources = P_RequiredResources.get(unitType, unitLevel);
    for (uint8 i = 0; i < resources.resources.length; i++) {
      uint8 resource = resources.resources[i];
      if (!P_IsUtility.get(resource)) continue;
      uint256 requiredAmount = resources.amounts[i] * count;
      if (requiredAmount == 0) continue;
      uint256 currentAmount = ResourceCount.get(asteroidEntity, resource);

      if (add) {
        require(currentAmount >= requiredAmount, "[LibUnit] Not enough utility resources");
        ResourceCount.set(asteroidEntity, resource, currentAmount - requiredAmount);
      } else {
        require(
          currentAmount + requiredAmount <= MaxResourceCount.get(asteroidEntity, resource),
          "[LibUnit] Can't store more utility resources"
        );
        ResourceCount.set(asteroidEntity, resource, currentAmount + requiredAmount);
      }
    }
  }

  /**
   * @dev Increases the count of a specific unit type for a player's asteroid.
   * @param asteroidEntity The identifier of the player's asteroid entity.
   * @param unitType The type of unit to increase.
   * @param unitCount The number of units to increase.
   */
  function increaseUnitCount(
    bytes32 asteroidEntity,
    bytes32 unitType,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    uint256 prevUnitCount = UnitCount.get(asteroidEntity, unitType);
    UnitCount.set(asteroidEntity, unitType, prevUnitCount + unitCount);
    if (updatesUtility) updateStoredUtilities(asteroidEntity, unitType, unitCount, true);
  }

  /**
   * @dev Decreases the count of a specific unit type for a player's asteroid entity.
   * @param asteroidEntity The identifier of the player's asteroid entity.
   * @param unitType The type of unit to decrease.
   * @param unitCount The number of units to decrease.
   */
  function decreaseUnitCount(
    bytes32 asteroidEntity,
    bytes32 unitType,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    uint256 currUnitCount = UnitCount.get(asteroidEntity, unitType);
    require(currUnitCount >= unitCount, "[LibUnit] Not enough units to decrease");
    UnitCount.set(asteroidEntity, unitType, currUnitCount - unitCount);
    if (updatesUtility) updateStoredUtilities(asteroidEntity, unitType, unitCount, false);
  }
}
