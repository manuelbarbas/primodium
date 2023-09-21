// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { UnitCount, Level, UnitLevel, Home, BuildingType, P_GameConfig, P_Unit, P_UnitProduction, P_UnitProdMultiplier, LastClaimedAt } from "codegen/Tables.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibMath } from "libraries/LibMath.sol";
import { UnitProductionQueue, UnitProductionQueueData } from "libraries/UnitProductionQueue.sol";

library LibUnit {
  /// @notice Check if a building can produce a unit
  /// @param buildingEntity Entity ID of the building
  /// @param unitPrototype Unit prototype to check
  /// @return True if unit can be produced, false otherwise
  function canProduceUnit(bytes32 buildingEntity, bytes32 unitPrototype) internal view returns (bool) {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    return P_UnitProduction.get(buildingPrototype, unitPrototype);
  }

  /// @notice Claim units from all player's buildings
  /// @param playerEntity Entity ID of the player
  function claimUnits(bytes32 playerEntity) internal {
    // get all player buildings that can produce units
    bytes32[] memory buildings = UnitFactorySet.getAll(playerEntity);
    for (uint256 i = 0; i < buildings.length; i++) {
      bytes32 building = buildings[i];
      claimBuildingUnits(playerEntity, building);
    }
  }

  /// @notice Claim units for a single building
  /// @param playerEntity Entity ID of the player
  /// @param building Entity ID of the building
  function claimBuildingUnits(bytes32 playerEntity, bytes32 building) internal {
    uint256 startTime = LastClaimedAt.get(building);
    LastClaimedAt.set(building, block.timestamp);

    bool stillClaiming = !UnitProductionQueue.isEmpty(building);
    while (stillClaiming) {
      UnitProductionQueueData memory item = UnitProductionQueue.peek(building);
      uint256 trainingTime = getUnitBuildTime(playerEntity, building, item.unitId);
      uint256 trainedUnits = LibMath.min(
        item.quantity,
        ((block.timestamp - startTime) * 100) / (trainingTime * P_GameConfig.getUnitProductionRate())
      );

      if (trainedUnits == 0) return;
      if (trainedUnits == item.quantity) {
        UnitProductionQueue.dequeue(building);
        stillClaiming = !UnitProductionQueue.isEmpty(building);
      } else {
        item.quantity -= trainedUnits;
        UnitProductionQueue.updateFront(building, item);
        stillClaiming = false;
      }
      startTime += trainingTime * trainedUnits;
      addUnitsToAsteroid(playerEntity, Home.getAsteroid(playerEntity), item.unitId, trainedUnits);
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
    uint256 multiplier = P_UnitProdMultiplier.get(building, buildingLevel);
    uint256 unitLevel = UnitLevel.get(playerEntity, unitPrototype);
    uint256 rawTrainingTime = P_Unit.getTrainingTime(unitPrototype, unitLevel);
    require(rawTrainingTime > 0 && multiplier > 0, "Training time is invalid");
    return (rawTrainingTime * 100) / multiplier;
  }

  /// @notice Add units to an asteroid
  /// @param playerEntity Entity ID of the player
  /// @param asteroid Entity ID of the asteroid
  /// @param unitPrototype Unit prototype to add
  /// @param quantity Number of units to add
  function addUnitsToAsteroid(
    bytes32 playerEntity,
    bytes32 asteroid,
    bytes32 unitPrototype,
    uint256 quantity
  ) internal {
    if (quantity == 0) return;
    uint256 prevUnitCount = UnitCount.get(playerEntity, asteroid, unitPrototype);
    UnitCount.set(playerEntity, asteroid, unitPrototype, prevUnitCount + quantity);
  }
}
