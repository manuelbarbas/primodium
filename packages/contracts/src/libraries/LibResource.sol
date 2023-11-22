// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";

import { UtilityMap } from "libraries/UtilityMap.sol";

import { OwnedMotherlodes, P_ConsumesResource, ConsumptionRate, Home, P_IsAdvancedResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_RequiredResources, Score, P_ScoreMultiplier, P_IsUtility, P_RequiredResources, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, P_EnumToPrototype, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/index.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibResource {
  /**
   * @dev Retrieves the available count of a specific resource for a spaceRock.
   * @param spaceRockEntity The identifier of the spaceRock.
   * @param resource The type of resource to check.
   * @return availableCount The available count of the specified resource.
   */
  function getResourceCountAvailable(bytes32 spaceRockEntity, uint8 resource) internal view returns (uint256) {
    uint256 max = MaxResourceCount.get(spaceRockEntity, resource);
    uint256 curr = ResourceCount.get(spaceRockEntity, resource);
    if (curr > max) return 0;
    return max - curr;
  }

  /// @notice Spends required resources of an entity, when creating/upgrading a building
  /// @notice claims all resources beforehand
  /// @param entity Entity ID of the building
  /// @param level Target level for the building
  function spendBuildingRequiredResources(bytes32 entity, uint256 level) internal {
    bytes32 spaceRockEntity = OwnedBy.get(entity);
    bytes32 buildingPrototype = BuildingType.get(entity);
    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(spaceRockEntity, entity, requiredResources.resources[i], requiredResources.amounts[i]);
    }
  }

  /// @notice Spends required resources of a unit, when adding to training queue
  /// @notice claims all resources beforehand
  /// @param spaceRockEntity Entity ID of the spaceRock
  /// @param prototype Unit Prototype
  /// @param count Quantity of units to be trained
  function spendUnitRequiredResources(
    bytes32 spaceRockEntity,
    bytes32 prototype,
    uint256 count
  ) internal {
    bytes32 playerEntity = OwnedBy.get(spaceRockEntity);
    uint256 level = UnitLevel.get(playerEntity, prototype);
    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(prototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(spaceRockEntity, prototype, requiredResources.resources[i], requiredResources.amounts[i] * count);
    }
  }

  /// @notice Spends resources required to upgrade a unit
  /// @notice claims all resources beforehand
  /// @param spaceRockEntity ID of the spaceRock upgrading
  /// @param unitPrototype Prototype ID of the unit to upgrade
  /// @param level Target level for the building
  function spendUpgradeResources(
    bytes32 spaceRockEntity,
    bytes32 unitPrototype,
    uint256 level
  ) internal {
    P_RequiredUpgradeResourcesData memory requiredResources = P_RequiredUpgradeResources.get(unitPrototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(spaceRockEntity, unitPrototype, requiredResources.resources[i], requiredResources.amounts[i]);
    }
  }

  /**
   * @dev Spends a specified amount of a resource by a spaceRock entity.
   * @param spaceRockEntity The identifier of the spaceRock entity.
   * @param entity The identifier of the entity from which resources are spent.
   * @param resource The type of the resource to be spent.
   * @param resourceCost The amount of the resource to be spent.
   * @notice Ensures that the spaceRock has enough of the specified resource and updates resource counts accordingly.
   */
  function spendResource(
    bytes32 spaceRockEntity,
    bytes32 entity,
    uint8 resource,
    uint256 resourceCost
  ) internal {
    // Check if the spaceRock has enough resources.
    uint256 spaceRockResourceCount = ResourceCount.get(spaceRockEntity, resource);
    require(resourceCost <= spaceRockResourceCount, "[SpendResources] Not enough resources to spend");

    // If the spent resource is a utility, add its cost to the total utility usage of the entity.
    if (P_IsUtility.get(resource)) {
      uint256 prevUtilityUsage = UtilityMap.get(entity, resource);
      // add to the total building utility usage
      UtilityMap.set(entity, resource, prevUtilityUsage + resourceCost);
    }

    // Spend resources. This will decrease the available resources for the spaceRock.
    LibStorage.decreaseStoredResource(spaceRockEntity, resource, resourceCost);
  }

  function claimAllPlayerResources(bytes32 playerEntity) internal {
    bytes32[] memory ownedMotherlodes = OwnedMotherlodes.get(playerEntity);
    for (uint256 i = 0; i < ownedMotherlodes.length; i++) {
      claimAllResources(ownedMotherlodes[i]);
    }
    claimAllResources(Home.getAsteroid(playerEntity));
  }

  /// @notice Claims all unclaimed resources of a spaceRock
  /// @param spaceRockEntity ID of the spaceRock to claim
  function claimAllResources(bytes32 spaceRockEntity) internal {
    uint256 lastClaimed = LastClaimedAt.get(spaceRockEntity);
    if (lastClaimed == block.timestamp) return;

    if (lastClaimed == 0) {
      LastClaimedAt.set(spaceRockEntity, block.timestamp);
      return;
    }

    uint256 timeSinceClaimed = block.timestamp - lastClaimed;
    timeSinceClaimed = (timeSinceClaimed * P_GameConfig.getWorldSpeed()) / WORLD_SPEED_SCALE;
    bytes32 playerEntity = OwnedBy.get(spaceRockEntity);
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    LastClaimedAt.set(spaceRockEntity, block.timestamp);
    uint256[] memory consumptionAmounts = new uint256[](uint8(EResource.LENGTH));
    for (uint8 i = 1; i < uint8(EResource.LENGTH); i++) {
      uint8 resource = i;
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      // you have no production rate
      uint256 productionRate = ProductionRate.get(spaceRockEntity, resource);
      if (productionRate == 0) continue;

      // add resource to storage
      uint256 increase = productionRate * timeSinceClaimed;

      uint8 consumedResource = P_ConsumesResource.get(resource);
      if (consumedResource > 0) {
        if (consumptionAmounts[consumedResource] == 0)
          consumptionAmounts[consumedResource] = consumeResource(spaceRockEntity, consumedResource, timeSinceClaimed);
        increase = productionRate * consumptionAmounts[consumedResource];
      }

      // add resource to storage

      ProducedResource.set(playerEntity, resource, ProducedResource.get(playerEntity, resource) + increase);
      LibStorage.increaseStoredResource(homeAsteroid, resource, increase);
    }
  }

  function consumeResource(
    bytes32 spaceRock,
    uint8 resource,
    uint256 timePassed
  ) internal returns (uint256) {
    uint256 consumptionRate = ConsumptionRate.get(spaceRock, resource);
    if (consumptionRate == 0) return 0;
    uint256 resourceCount = ResourceCount.get(spaceRock, resource);
    uint256 maxConsumed = resourceCount / consumptionRate;
    if (maxConsumed < timePassed) timePassed = maxConsumed;
    ResourceCount.set(spaceRock, resource, resourceCount - (consumptionRate * timePassed));
    return timePassed;
  }

  /// @notice Clears utility usage of a building when it is destroyed
  /// @param buildingEntity ID of the building to clear
  function clearUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      UtilityMap.remove(buildingEntity, utility);
      LibStorage.increaseStoredResource(spaceRockEntity, utility, utilityUsage);
    }
  }

  /**
   * @dev Retrieves the counts of all non-utility resources for a spaceRock and calculates the total.
   * @param spaceRockEntity The identifier of the spaceRock.
   * @return totalResources The total count of non-utility resources.
   * @return resourceCounts An array containing the counts of each non-utility resource.
   */
  function getAllResourceCounts(bytes32 spaceRockEntity)
    internal
    view
    returns (uint256 totalResources, uint256[] memory resourceCounts)
  {
    resourceCounts = new uint256[](uint8(EResource.LENGTH));
    for (uint8 i = 1; i < resourceCounts.length; i++) {
      if (P_IsUtility.get(i)) continue;
      resourceCounts[i] = ResourceCount.get(spaceRockEntity, i);
      totalResources += resourceCounts[i];
    }
  }

  /**
   * @dev Retrieves the counts of all non-utility resources for a spaceRock and calculates the total.
   * @param spaceRockEntity The identifier of the spaceRock.
   * @return totalResources The total count of non-utility resources.
   * @return resourceCounts An array containing the counts of each non-utility resource.
   */
  function getAllResourceCountsVaulted(bytes32 spaceRockEntity)
    internal
    view
    returns (uint256 totalResources, uint256[] memory resourceCounts)
  {
    resourceCounts = new uint256[](uint8(EResource.LENGTH));
    for (uint8 i = 1; i < resourceCounts.length; i++) {
      if (P_IsUtility.get(i)) continue;
      resourceCounts[i] = ResourceCount.get(spaceRockEntity, i);
      uint256 vaulted = ResourceCount.get(
        spaceRockEntity,
        P_IsAdvancedResource.get(i) ? uint8(EResource.U_AdvancedUnraidable) : uint8(EResource.U_Unraidable)
      );
      if (vaulted > resourceCounts[i]) resourceCounts[i] = 0;
      else resourceCounts[i] -= vaulted;
      totalResources += resourceCounts[i];
    }
  }

  function updateScore(
    bytes32 player,
    uint8 resource,
    uint256 value
  ) internal {
    uint256 count = ResourceCount.get(Home.getAsteroid(player), resource);
    uint256 currentScore = Score.get(player);
    uint256 scoreChangeAmount = P_ScoreMultiplier.get(resource);

    if (value < count) {
      scoreChangeAmount *= (count - value);
      if (scoreChangeAmount > currentScore) {
        scoreChangeAmount = currentScore;
      }
      currentScore -= scoreChangeAmount;
    } else {
      scoreChangeAmount *= (value - count);
      currentScore += scoreChangeAmount;
    }
    Score.set(player, currentScore);
  }
}
