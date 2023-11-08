// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { P_ListMaxResourceUpgrades, P_ByLevelMaxResourceUpgrades, MaxResourceCount, Level, ResourceCount, BuildingType } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";

library LibStorage {
  /// @notice Increases the max storage of resources based on building prototype data
  /// @notice uses P_ByLevelMaxResourceUpgrades and P_LisMaxResourceUpgrades to track storage upgrades
  /// @param playerEntity ID of the owner of the building
  /// @param buildingEntity ID of the building to update
  /// @param level of the building to pull prototype data from
  function increaseMaxStorage(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);

    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint8 resource = (storageResources[i]);
      uint256 maxResource = MaxResourceCount.get(playerEntity, resource);
      uint256 maxResourceIncrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      if (level > 1) {
        maxResourceIncrease -= P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level - 1);
      }
      setMaxStorage(playerEntity, resource, maxResource + maxResourceIncrease);
    }
  }

  /// @notice clears max storage increase upon destroying a builing
  /// @param playerEntity ID of the owner of the building
  /// @param buildingEntity ID of the building to clear
  function clearMaxStorageIncrease(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint8 i = 0; i < storageResources.length; i++) {
      uint8 resource = storageResources[i];
      uint256 maxResource = MaxResourceCount.get(playerEntity, resource);
      uint256 maxResourceDecrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      require(maxResource >= maxResourceDecrease, "[StorageUsage] not enough storage to reduce usage");
      setMaxStorage(playerEntity, resource, maxResource - maxResourceDecrease);
    }
  }

  /* -------------------------- Non-Utility Resources ------------------------- */
  /// @notice decreases stored resources upon building creation or upgrading
  /// @param playerEntity ID of the player to update
  /// @param resource ID of the resource to decrease
  /// @param resourceToDecrease amount of resource to be decreased
  function decreaseStoredResource(
    bytes32 playerEntity,
    uint8 resource,
    uint256 resourceToDecrease
  ) internal {
    uint256 resourceCount = ResourceCount.get(playerEntity, resource);
    uint256 newResourceCount = resourceCount < resourceToDecrease ? 0 : resourceCount - resourceToDecrease;
    ResourceCount.set(playerEntity, resource, newResourceCount);
  }

  /// @notice increases stored resources upon building creation or upgrading
  /// @param playerEntity ID of the player to update
  /// @param resource ID of the resource to increase
  /// @param resourceToAdd amount of resource to be increased
  function increaseStoredResource(
    bytes32 playerEntity,
    uint8 resource,
    uint256 resourceToAdd
  ) internal {
    uint256 resourceCount = ResourceCount.get(playerEntity, resource);
    uint256 maxResources = MaxResourceCount.get(playerEntity, resource);
    uint256 newResourceCount = LibMath.min(resourceCount + resourceToAdd, maxResources);
    ResourceCount.set(playerEntity, resource, newResourceCount);
  }

  /// @notice sets the max storage of a resource
  /// @param playerEntity ID of the  player to update
  /// @param resource ID of the resource to increase
  /// @param newMaxStorage amount of max storage resource to be set
  function setMaxStorage(
    bytes32 playerEntity,
    uint8 resource,
    uint256 newMaxStorage
  ) internal {
    MaxResourceCount.set(playerEntity, resource, newMaxStorage);
    uint256 playerResourceAmount = ResourceCount.get(playerEntity, resource);
    if (playerResourceAmount > newMaxStorage) {
      ResourceCount.set(playerEntity, resource, newMaxStorage);
    }
  }

  /* ---------------------------- Utility Resources --------------------------- */

  /// @notice increases the max storage of a utility
  /// @param playerEntity ID of the  player to update
  /// @param resource ID of the utility to increase
  /// @param amountToIncrease of max storage to be set
  function increaseMaxUtility(
    bytes32 playerEntity,
    uint8 resource,
    uint256 amountToIncrease
  ) internal {
    uint256 prevMax = MaxResourceCount.get(playerEntity, resource);
    setMaxStorage(playerEntity, resource, prevMax + amountToIncrease);
  }

  /// @notice increases the max storage of a utility
  /// @param playerEntity ID of the  player to update
  /// @param resource ID of the resource to decrease
  /// @param amountToDecrease of max storage to be set
  function decreaseMaxUtility(
    bytes32 playerEntity,
    uint8 resource,
    uint256 amountToDecrease
  ) internal {
    uint256 maxUtility = MaxResourceCount.get(playerEntity, resource);
    if (maxUtility < amountToDecrease) {
      MaxResourceCount.set(playerEntity, resource, 0);
      return;
    }
    setMaxStorage(playerEntity, resource, maxUtility - amountToDecrease);
  }
}
