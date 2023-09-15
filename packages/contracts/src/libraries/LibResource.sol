// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EBuilding, EResource } from "src/Types.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { SetPlayerResource } from "libraries/SetPlayerResource.sol";
import { P_IsUtility, P_RequiredResources, P_RequiredResourcesData, P_EnumToPrototype, UtilityUsage, LastClaimedAt, ProductionRate } from "codegen/Tables.sol";
import { BuildingKey } from "src/Keys.sol";

library LibResource {
  /// notice: this function should only be called after all resources have been claimed
  /// notice: this function adds resources from the last claimed time

  function spendRequiredResources(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    uint32 level
  ) internal {
    claimAllResources(playerEntity);

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      EResource resource = EResource(requiredResources.resources[i]);

      // check if player has enough resources
      uint32 resourceCost = requiredResources.amounts[i];
      uint32 playerResourceCount = SetPlayerResource.get(playerEntity, resource);
      require(resourceCost <= playerResourceCount, "[SpendResources] Not enough resources to spend");

      // spend resources
      LibStorage.decreaseStoredResource(playerEntity, resource, resourceCost);

      // add total utility usage to building
      if (P_IsUtility.get(resource)) {
        uint32 prevUtilityUsage = UtilityUsage.get(playerEntity, resource);
        UtilityUsage.set(playerEntity, resource, prevUtilityUsage + resourceCost);
      }
    }
  }

  function claimAllResources(bytes32 playerEntity) internal {
    uint8[] memory resources = SetPlayerResource.getAll(playerEntity);
    uint256 lastClaimed = LastClaimedAt.get(playerEntity);
    if (lastClaimed == 0 || lastClaimed == block.timestamp) return;
    LastClaimedAt.set(playerEntity, block.timestamp);
    for (uint256 i = 0; i < resources.length; i++) {
      EResource resource = EResource(resources[i]);
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      // you have no production rate
      uint32 productionRate = ProductionRate.get(playerEntity, resource);
      if (productionRate == 0) continue;

      // add resource to storage
      uint32 unclaimedResource = (productionRate * uint32(block.timestamp - lastClaimed));
      LibStorage.increaseStoredResource(playerEntity, resource, unclaimedResource);
    }
  }

  function clearUtilityUsage(bytes32 playerEntity, bytes32 buildingEntity) internal {
    uint8[] memory resources = SetPlayerResource.getAll(playerEntity);
    for (uint256 i = 0; i < resources.length; i++) {
      EResource resource = EResource(resources[i]);
      if (!P_IsUtility.get(resource)) continue;
      uint32 utilityUsage = UtilityUsage.get(buildingEntity, resource);
      UtilityUsage.deleteRecord(buildingEntity, resource);
      LibStorage.increaseStoredResource(playerEntity, resource, utilityUsage);
    }
  }
}
