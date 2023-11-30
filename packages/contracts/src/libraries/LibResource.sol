// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";

import { UtilityMap } from "libraries/UtilityMap.sol";

import { Level, IsActive, Motherlode, OwnedMotherlodes, P_ConsumesResource, ConsumptionRate, Home, P_IsAdvancedResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_RequiredResources, Score, P_ScoreMultiplier, P_IsUtility, P_RequiredResources, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, P_EnumToPrototype, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/index.sol";

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
    bool isUtility = P_IsUtility.get(resource);
    if (isUtility) {
      // If the spent resource is a utility, add its cost to the total utility usage of the entity.
      uint256 prevUtilityUsage = UtilityMap.get(entity, resource);
      // add to the total building utility usage
      UtilityMap.set(entity, resource, prevUtilityUsage + resourceCost);
    }
    //since same function is being used for entities and prototypes level > 0 is used to know that the entity is not a prototype
    if (isUtility && Level.get(entity) > 0 && !IsActive.get(entity)) return;

    require(resourceCost <= spaceRockResourceCount, "[SpendResources] Not enough resources to spend");
    // Spend resources. This will decrease the available resources for the spaceRock.
    LibStorage.decreaseStoredResource(spaceRockEntity, resource, resourceCost);
  }

  function claimAllPlayerResources(bytes32 playerEntity) internal {
    bytes32[] memory ownedMotherlodes = OwnedMotherlodes.get(playerEntity);
    for (uint256 i = 0; i < ownedMotherlodes.length; i++) {
      claimMotherlodeResource(ownedMotherlodes[i]);
    }
    claimAllResources(Home.getAsteroid(playerEntity));
  }

  /// @notice Claims all unclaimed resources of a motherlode
  /// @param spaceRockEntity ID of the spaceRock motherlode to claim
  function claimMotherlodeResource(bytes32 spaceRockEntity) internal {
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
    uint256[] memory consumptionTimeLengths = new uint256[](uint8(EResource.LENGTH));

    uint8 resource = Motherlode.getMotherlodeType(spaceRockEntity);
    uint8 consumesResource = P_ConsumesResource.get(resource);

    uint256 productionRate = ProductionRate.get(spaceRockEntity, resource);
    uint256 consumptionRate = ConsumptionRate.get(spaceRockEntity, consumesResource);

    // if both are zero then no need to update
    if (productionRate == 0 && consumptionRate == 0) return;

    // the maximum amount of resourecs that will minedAmount if there is enough of the resource available minedAmount < resourceCount
    uint256 minedAmount = (consumptionRate * timeSinceClaimed);
    uint256 resourceCount = ResourceCount.get(spaceRockEntity, consumesResource);
    if (resourceCount < minedAmount) {
      //we use the time length to reduce current resource amount by the difference of the minedAmount and the increase
      minedAmount = (consumptionRate * resourceCount) / consumptionRate;
    }
    LibStorage.decreaseStoredResource(spaceRockEntity, consumesResource, minedAmount);

    ProducedResource.set(playerEntity, resource, ProducedResource.get(playerEntity, resource) + minedAmount);
    LibStorage.increaseStoredResource(homeAsteroid, resource, minedAmount);
  }

  /// @notice Claims all unclaimed resources of a spaceRock
  /// @param spaceRockEntity ID of the spaceRock to claim
  function claimAllResources(bytes32 spaceRockEntity) internal {
    // this condition and logic is here so we don't have to change hooks logic and customize for space rock type.
    if (Motherlode.getMotherlodeType(spaceRockEntity) > 0) {
      claimMotherlodeResource(spaceRockEntity);
      return;
    }

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
    uint256[] memory consumptionTimeLengths = new uint256[](uint8(EResource.LENGTH));

    for (uint8 resource = 1; resource < uint8(EResource.LENGTH); resource++) {
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
      uint256 productionRate = ProductionRate.get(spaceRockEntity, resource);
      uint256 consumptionRate = ConsumptionRate.get(spaceRockEntity, resource);

      // if both are zero then no need to update
      if (productionRate == 0 && consumptionRate == 0) continue;

      //first we calculate production
      uint256 increase = 0;
      if (productionRate > 0) {
        //check to see if this resource consumes another resource to be produced
        uint8 consumesResource = P_ConsumesResource.get(resource);
        //if this resource consumes another resource the maxium time it can be produced is the maximum time that the required resource is consumed
        uint256 producedTime = consumesResource > 0 ? consumptionTimeLengths[consumesResource] : timeSinceClaimed;

        //the amount of resource that has been produced
        increase = productionRate * producedTime;
        ProducedResource.set(playerEntity, resource, ProducedResource.get(playerEntity, resource) + increase);
      }

      // the maximum amount of resourecs that will decrease if there is enough of the resource available decrease < resourceCount + increase
      uint256 decrease = (consumptionRate * timeSinceClaimed);

      //the maximum amount of time from the last update to this current time is the maximum amount of time this resource could have been consumed
      consumptionTimeLengths[resource] = timeSinceClaimed;

      //if increase and decrease match than nothing to update
      if (increase == decrease) continue;

      uint256 resourceCount = ResourceCount.get(spaceRockEntity, resource);
      if (increase > decrease) {
        //if the increase is more than the decrease than we just increase by the difference
        //todo currently we increase the resources for home asteroid as resource transfer is not a part of this update
        LibStorage.increaseStoredResource(homeAsteroid, resource, increase - decrease);
      } else if (resourceCount + increase >= decrease) {
        //if sum of the increase and curr amount is more than the decrease we just decrease by the difference
        //consumption is from current space rock and will be in the future
        LibStorage.decreaseStoredResource(spaceRockEntity, resource, decrease - increase);
      } else {
        //if the decrease is more than the sum of increase and current amount than the sum is tha maximum that can be consumed
        // we use this amount to see how much time the resource can be consumed
        consumptionTimeLengths[resource] = (resourceCount + increase) / consumptionRate;
        //we use the time length to reduce current resource amount by the difference of the decrease and the increase
        decrease = consumptionRate * consumptionTimeLengths[resource];
        //consumption is from current space rock and will be in the future
        LibStorage.decreaseStoredResource(spaceRockEntity, resource, decrease - increase);
      }
    }
  }

  /// @notice Clears utility usage of a building when it i s destroyed
  /// @param buildingEntity ID of the building to clear
  function clearUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      UtilityMap.remove(buildingEntity, utility);
      if (IsActive.get(buildingEntity)) LibStorage.increaseStoredResource(spaceRockEntity, utility, utilityUsage);
    }
  }

  /// @notice deactivates utility usage of a building when it is toggled
  /// @param buildingEntity ID of the building to clear
  function deactivateUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      // remove utility usage
      LibStorage.increaseStoredResource(spaceRockEntity, utility, utilityUsage);
    }
  }

  /// @notice activates utility usage of a building when it is toggled
  /// @param buildingEntity ID of the building to clear
  function activateUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      require(
        ResourceCount.get(spaceRockEntity, utility) >= utilityUsage,
        "[ToggleBuilding] Not enough available utility to activate building"
      );
      // activate utility usage
      LibStorage.decreaseStoredResource(spaceRockEntity, utility, utilityUsage);
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
