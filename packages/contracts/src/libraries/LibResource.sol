// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EBuilding, EResource } from "src/Types.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UtilitySet } from "libraries/UtilitySet.sol";
import { P_IsUtility, P_RequiredResources, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, P_EnumToPrototype, ResourceCount, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/Tables.sol";
import { BuildingKey } from "src/Keys.sol";

library LibResource {
  /// @notice Spends required resources of an entity, when creating/upgrading a building or enqueueing a unit
  /// @notice claims all resources beforehand
  /// @param entity Entity ID of the building
  /// @param level Target level for the building
  function spendRequiredResources(bytes32 entity, uint256 level) internal {
    bytes32 playerEntity = OwnedBy.get(entity);
    claimAllResources(playerEntity);
    bytes32 buildingPrototype = BuildingType.get(entity);
    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(playerEntity, entity, EResource(requiredResources.resources[i]), requiredResources.amounts[i]);
    }
  }

  /// @notice Spends resources required to upgrade a unit
  /// @notice claims all resources beforehand
  /// @param playerEntity ID of the player upgrading
  /// @param unitPrototype Prototype ID of the unit to upgrade
  /// @param level Target level for the building
  function spendUpgradeResources(
    bytes32 playerEntity,
    bytes32 unitPrototype,
    uint256 level
  ) internal {
    claimAllResources(playerEntity);
    P_RequiredUpgradeResourcesData memory requiredResources = P_RequiredUpgradeResources.get(unitPrototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      spendResource(
        playerEntity,
        unitPrototype,
        EResource(requiredResources.resources[i]),
        requiredResources.amounts[i]
      );
    }
  }

  function spendResource(
    bytes32 playerEntity,
    bytes32 entity,
    EResource resource,
    uint256 resourceCost
  ) internal {
    // check if player has enough resources
    uint256 playerResourceCount = ResourceCount.get(playerEntity, resource);
    require(resourceCost <= playerResourceCount, "[SpendResources] Not enough resources to spend");

    // add total utility usage to building
    if (P_IsUtility.get(resource)) {
      uint256 prevUtilityUsage = UtilitySet.get(entity, resource);
      // if the building already has utility usage, add the difference
      resourceCost = resourceCost - prevUtilityUsage;
      UtilitySet.set(entity, resource, resourceCost);
    }
    // spend resources. note: this will also decrease available utilities
    LibStorage.decreaseStoredResource(playerEntity, resource, resourceCost);
  }

  /// @notice Claims all unclaimed resources of a player
  /// @param playerEntity ID of the player to claim
  function claimAllResources(bytes32 playerEntity) internal {
    uint256 lastClaimed = LastClaimedAt.get(playerEntity);
    if (lastClaimed == 0 || lastClaimed == block.timestamp) return;
    uint256 timeSinceClaimed = block.timestamp - lastClaimed;
    LastClaimedAt.set(playerEntity, block.timestamp);
    for (uint8 i = 1; i < uint8(EResource.LENGTH); i++) {
      EResource resource = EResource(i);
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      // you have no production rate
      uint256 productionRate = ProductionRate.get(playerEntity, resource);
      if (productionRate == 0) continue;

      // add resource to storage
      LibStorage.increaseStoredResource(playerEntity, resource, productionRate * timeSinceClaimed);
    }
  }

  /// @notice Clears utility usage of a building when it is destroyed
  /// @param playerEntity ID of the owner of the building
  /// @param buildingEntity ID of the building to clear
  function clearUtilityUsage(bytes32 playerEntity, bytes32 buildingEntity) internal {
    uint8[] memory utilities = UtilitySet.getAll(buildingEntity);
    for (uint256 i = 0; i < utilities.length; i++) {
      EResource utility = EResource(utilities[i]);
      uint256 utilityUsage = UtilitySet.get(buildingEntity, utility);
      UtilitySet.remove(buildingEntity, utility);
      LibStorage.increaseStoredResource(playerEntity, utility, utilityUsage);
    }
  }
}
