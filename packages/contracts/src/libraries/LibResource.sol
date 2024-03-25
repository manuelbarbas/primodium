// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";
import { CapitalShipPrototypeId } from "codegen/Prototypes.sol";

import { P_CapitalShipConfig, P_Transportables, Level, IsActive, P_ConsumesResource, ConsumptionRate, P_IsResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_IsUtility, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/index.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibResource {
  /**
   * @dev Retrieves the available count of a specific resource for a asteroid.
   * @param asteroidEntity The identifier of the asteroid.
   * @param resource The type of resource to check.
   * @return availableCount The available count of the specified resource.
   */
  function getResourceCountAvailable(bytes32 asteroidEntity, uint8 resource) internal view returns (uint256) {
    uint256 max = MaxResourceCount.get(asteroidEntity, resource);
    uint256 curr = ResourceCount.get(asteroidEntity, resource);
    if (curr > max) return 0;
    return max - curr;
  }

  /// @notice Spends required resources of an entity, when creating/upgrading a building
  /// @notice claims all resources beforehand
  /// @param entity Entity ID of the building
  /// @param level Target level for the building
  function spendBuildingRequiredResources(bytes32 entity, uint256 level) internal {
    bytes32 asteroidEntity = OwnedBy.get(entity);
    bytes32 buildingPrototype = BuildingType.get(entity);
    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(asteroidEntity, entity, requiredResources.resources[i], requiredResources.amounts[i]);
    }
  }

  /// @notice Spends required resources of a unit, when adding to training queue
  /// @notice claims all resources beforehand
  /// @param asteroidEntity Entity ID of the asteroid
  /// @param prototype Unit Prototype
  /// @param count Quantity of units to be trained
  function spendUnitRequiredResources(bytes32 asteroidEntity, bytes32 prototype, uint256 count) internal {
    if (prototype == CapitalShipPrototypeId) {
      require(count == 1, "[SpendResources] Colony ships can only be trained one at a time");
      uint256 cost = P_CapitalShipConfig.getInitialCost() *
        LibUnit.getCapitalShipCostMultiplier(OwnedBy.get(asteroidEntity));

      spendResource(asteroidEntity, prototype, P_CapitalShipConfig.getResource(), cost);
    }

    uint256 level = UnitLevel.get(asteroidEntity, prototype);
    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(prototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(asteroidEntity, prototype, requiredResources.resources[i], requiredResources.amounts[i] * count);
    }
  }

  /// @notice Spends resources required to upgrade a unit
  /// @notice claims all resources beforehand
  /// @param asteroidEntity ID of the asteroid upgrading
  /// @param prototype Prototype ID of the prototype to upgrade
  /// @param level Target level for the building
  function spendUpgradeResources(bytes32 asteroidEntity, bytes32 prototype, uint256 level) internal {
    P_RequiredUpgradeResourcesData memory requiredResources = P_RequiredUpgradeResources.get(prototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(asteroidEntity, prototype, requiredResources.resources[i], requiredResources.amounts[i]);
    }
  }

  /**
   * @dev Spends a specified amount of a resource by a asteroid entity.
   * @param asteroidEntity The identifier of the asteroid entity.
   * @param entity The identifier of the entity from which resources are spent.
   * @param resource The type of the resource to be spent.
   * @param resourceCost The amount of the resource to be spent.
   * @notice Ensures that the asteroid has enough of the specified resource and updates resource counts accordingly.
   */
  function spendResource(bytes32 asteroidEntity, bytes32 entity, uint8 resource, uint256 resourceCost) internal {
    // Check if the asteroid has enough resources.
    uint256 asteroidResourceCount = ResourceCount.get(asteroidEntity, resource);
    bool isUtility = P_IsUtility.get(resource);
    if (isUtility) {
      // If the spent resource is a utility, add its cost to the total utility usage of the entity.
      uint256 prevUtilityUsage = UtilityMap.get(entity, resource);
      // add to the total building utility usage
      UtilityMap.set(entity, resource, prevUtilityUsage + resourceCost);
    }
    //since same function is being used for entities and prototypes level > 0 is used to know that the entity is not a prototype
    if (isUtility && Level.get(entity) > 0 && !IsActive.get(entity)) return;

    require(resourceCost <= asteroidResourceCount, "[SpendResources] Not enough resources to spend");
    // Spend resources. This will decrease the available resources for the asteroid.
    LibStorage.decreaseStoredResource(asteroidEntity, resource, resourceCost);
  }

  /// @notice Claims all unclaimed resources of a asteroid
  /// @param asteroidEntity ID of the asteroid to claim
  function claimAllResources(bytes32 asteroidEntity) internal {
    uint256 lastClaimed = LastClaimedAt.get(asteroidEntity);

    if (lastClaimed == block.timestamp) return;

    if (lastClaimed == 0) {
      LastClaimedAt.set(asteroidEntity, block.timestamp);
      return;
    }

    uint256 timeSinceClaimed = block.timestamp - lastClaimed;
    timeSinceClaimed = (timeSinceClaimed * P_GameConfig.getWorldSpeed()) / WORLD_SPEED_SCALE;
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);
    LastClaimedAt.set(asteroidEntity, block.timestamp);
    uint256[] memory consumptionTimeLengths = new uint256[](uint8(EResource.LENGTH));

    for (uint8 resource = 1; resource < uint8(EResource.LENGTH); resource++) {
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      //each resource has a production and consumption value. these values need to be seperate so we can calculate best outcome of production and consumption
      uint256 productionRate = ProductionRate.get(asteroidEntity, resource);
      uint256 consumptionRate = ConsumptionRate.get(asteroidEntity, resource);

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

      uint256 resourceCount = ResourceCount.get(asteroidEntity, resource);
      if (increase > decrease) {
        //if the increase is more than the decrease than we just increase by the difference
        //todo currently we increase the resources for the current asteroid as resource transfer is not a part of this update
        LibStorage.increaseStoredResource(asteroidEntity, resource, increase - decrease);
      } else if (resourceCount + increase >= decrease) {
        //if sum of the increase and curr amount is more than the decrease we just decrease by the difference
        //consumption is from current asteroid and will be in the future
        LibStorage.decreaseStoredResource(asteroidEntity, resource, decrease - increase);
      } else {
        //if the decrease is more than the sum of increase and current amount than the sum is tha maximum that can be consumed
        // we use this amount to see how much time the resource can be consumed
        decrease = resourceCount + increase;
        consumptionTimeLengths[resource] = decrease / consumptionRate;
        //consumption is from current asteroid and will be in the future
        LibStorage.decreaseStoredResource(asteroidEntity, resource, decrease - increase);
      }
    }
  }

  /// @notice Clears utility usage of a building when it i s destroyed
  /// @param buildingEntity ID of the building to clear
  function clearUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      UtilityMap.remove(buildingEntity, utility);
      if (IsActive.get(buildingEntity)) LibStorage.increaseStoredResource(asteroidEntity, utility, utilityUsage);
    }
  }

  /// @notice deactivates utility usage of a building when it is toggled
  /// @param buildingEntity ID of the building to clear
  function deactivateUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      // remove utility usage
      LibStorage.increaseStoredResource(asteroidEntity, utility, utilityUsage);
    }
  }

  /// @notice activates utility usage of a building when it is toggled
  /// @param buildingEntity ID of the building to clear
  function activateUtilityUsage(bytes32 buildingEntity) internal {
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint8[] memory utilities = UtilityMap.keys(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      uint8 utility = utilities[i];
      uint256 utilityUsage = UtilityMap.get(buildingEntity, utility);
      require(
        ResourceCount.get(asteroidEntity, utility) >= utilityUsage,
        "[ToggleBuilding] Not enough available utility to activate building"
      );
      // activate utility usage
      LibStorage.decreaseStoredResource(asteroidEntity, utility, utilityUsage);
    }
  }

  /**
   * @dev Retrieves the counts of all non-utility resources for a asteroid and calculates the total.
   * @param asteroidEntity The identifier of the asteroid.
   * @return totalResources The total count of non-utility resources.
   */
  function getStoredResourceCountVaulted(bytes32 asteroidEntity) internal view returns (uint256 totalResources) {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 resourceCount = ResourceCount.get(asteroidEntity, transportables[i]);
      if (resourceCount == 0) continue;
      uint256 vaulted = ResourceCount.get(
        asteroidEntity,
        P_IsResource.getIsAdvanced(transportables[i])
          ? uint8(EResource.U_AdvancedUnraidable)
          : uint8(EResource.U_Unraidable)
      );
      if (vaulted > resourceCount) resourceCount = 0;
      else resourceCount -= vaulted;
      totalResources += resourceCount;
    }
  }

  /**
   * @dev Retrieves the counts of all non-utility resources for a asteroid and calculates the total.
   * @param asteroidEntity The identifier of the asteroid.
   * @return resourceCounts An array containing the counts of each non-utility resource.
   * @return totalResources The total count of non-utility resources.
   */
  function getStoredResourceCountsVaulted(
    bytes32 asteroidEntity
  ) internal view returns (uint256[] memory resourceCounts, uint256 totalResources) {
    uint8[] memory transportables = P_Transportables.get();
    resourceCounts = new uint256[](transportables.length);
    for (uint8 i = 0; i < transportables.length; i++) {
      resourceCounts[i] = ResourceCount.get(asteroidEntity, transportables[i]);
      if (resourceCounts[i] == 0) continue;
      uint256 vaulted = ResourceCount.get(
        asteroidEntity,
        P_IsResource.getIsAdvanced(transportables[i])
          ? uint8(EResource.U_AdvancedUnraidable)
          : uint8(EResource.U_Unraidable)
      );
      if (vaulted > resourceCounts[i]) resourceCounts[i] = 0;
      else resourceCounts[i] -= vaulted;
      totalResources += resourceCounts[i];
    }
  }
}
