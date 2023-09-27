// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_RequiredResourcesData, P_RequiredResources, P_IsUtility, UnitCount, ResourceCount, Level, UnitLevel, Home, BuildingType, P_GameConfig, P_Unit, P_UnitProduction, P_UnitProdMultiplier, LastClaimedAt } from "codegen/Tables.sol";
import { EResource } from "src/Types.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibResource } from "libraries/LibResource.sol";
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
      increaseUnitCount(playerEntity, Home.getAsteroid(playerEntity), item.unitId, trainedUnits);
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

  /**
   * @dev Updates the stored utility resources based on the addition or removal of units.
   * @param playerEntity The identifier of the player.
   * @param unitType The type of unit.
   * @param count The number of units being added or removed.
   * @param add A boolean indicating whether units are being added (true) or removed (false).
   */
  function updateStoredUtilities(
    bytes32 playerEntity,
    bytes32 unitType,
    uint256 count,
    bool add
  ) internal {
    if (count == 0) return;

    uint256 unitLevel = UnitLevel.get(playerEntity, unitType);

    P_RequiredResourcesData memory resources = P_RequiredResources.get(unitType, unitLevel);
    for (uint256 i = 0; i < resources.resources.length; i++) {
      EResource resource = EResource(resources.resources[i]);
      if (!P_IsUtility.get(resource)) continue;
      uint256 requiredAmount = resources.amounts[i] * count;
      uint256 currentAmount = ResourceCount.get(playerEntity, resource);

      if (add) {
        require(
          LibResource.getResourceCountAvailable(playerEntity, resource) >= requiredAmount,
          "[Reinforce] Not enough resources"
        );
        ResourceCount.set(playerEntity, resource, currentAmount + requiredAmount);
      } else if (requiredAmount < currentAmount) {
        ResourceCount.set(playerEntity, resource, currentAmount - requiredAmount);
      } else {
        ResourceCount.set(playerEntity, resource, 0);
      }
    }
  }

  /**
   * @dev Increases the count of a specific unit type for a player's rock entity.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the player's rock entity.
   * @param unitType The type of unit to increase.
   * @param unitCount The number of units to increase.
   */
  function increaseUnitCount(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 unitType,
    uint256 unitCount
  ) internal {
    if (unitCount == 0) return;
    uint256 prevUnitCount = UnitCount.get(playerEntity, asteroid, unitPrototype);
    UnitCount.set(playerEntity, asteroid, unitPrototype, prevUnitCount + quantity);
  }

  /**
   * @dev Decreases the count of a specific unit type for a player's rock entity.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the player's rock entity.
   * @param unitType The type of unit to decrease.
   * @param unitCount The number of units to decrease.
   */
  function decreaseUnitCount(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 unitType,
    uint256 unitCount
  ) internal {
    updateStoredUtilities(playerEntity, unitType, unitCount, false);

    uint256 currUnitCount = UnitCount.get(playerEntity, rockEntity, unitType);
    if (unitCount > currUnitCount) unitCount = currUnitCount;
    UnitCount.set(playerEntity, rockEntity, unitType, currUnitCount - unitCount);
  }
}
