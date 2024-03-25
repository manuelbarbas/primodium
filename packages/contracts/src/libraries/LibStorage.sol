// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { P_IsRecoverable, OwnedBy, P_ListMaxResourceUpgrades, P_ByLevelMaxResourceUpgrades, MaxResourceCount, Level, ResourceCount, BuildingType } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";

library LibStorage {
  /// @notice Increases the max storage of resources based on building prototype data
  /// @notice uses P_ByLevelMaxResourceUpgrades and P_LisMaxResourceUpgrades to track storage upgrades
  /// @param buildingEntity ID of the building to update
  /// @param level of the building to pull prototype data from
  function increaseMaxStorage(bytes32 buildingEntity, uint256 level) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint8 resource = (storageResources[i]);
      uint256 maxResourceIncrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      if (level > 1) {
        maxResourceIncrease -= P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level - 1);
      }
      increaseMaxStorage(asteroidEntity, resource, maxResourceIncrease);
    }
  }

  function increaseMaxStorage(bytes32 asteroidEntity, uint8 resource, uint256 amount) internal {
    uint256 maxResource = MaxResourceCount.get(asteroidEntity, resource);
    setMaxStorage(asteroidEntity, resource, maxResource + amount);
    if (P_IsRecoverable.get(resource)) {
      increaseStoredResource(asteroidEntity, resource, amount);
    }
  }

  function decreaseMaxStorage(bytes32 asteroidEntity, uint8 resource, uint256 amount) internal {
    uint256 maxResource = MaxResourceCount.get(asteroidEntity, resource);
    require(maxResource >= amount, "[StorageUsage] not enough storage to reduce usage");
    setMaxStorage(asteroidEntity, resource, maxResource - amount);
  }

  /// @notice activates the max storage of resources based on building prototype data
  /// @notice uses P_ByLevelMaxResourceUpgrades and P_LisMaxResourceUpgrades to track storage upgrades
  /// @param buildingEntity ID of the building to update
  /// @param level of the building to pull prototype data from
  function activateMaxStorage(bytes32 buildingEntity, uint256 level) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint8 resource = (storageResources[i]);
      uint256 maxResource = MaxResourceCount.get(asteroidEntity, resource);
      uint256 maxResourceIncrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      setMaxStorage(asteroidEntity, resource, maxResource + maxResourceIncrease);
    }
  }

  /// @notice clears max storage increase upon destroying a builing
  /// @param buildingEntity ID of the building to clear
  function clearMaxStorageIncrease(bytes32 buildingEntity) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint8 i = 0; i < storageResources.length; i++) {
      uint8 resource = storageResources[i];
      uint256 maxResource = MaxResourceCount.get(asteroidEntity, resource);
      uint256 maxResourceDecrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      require(maxResource >= maxResourceDecrease, "[StorageUsage] not enough storage to reduce usage");
      setMaxStorage(asteroidEntity, resource, maxResource - maxResourceDecrease);
    }
  }

  /* -------------------------- Non-Utility Resources ------------------------- */
  /// @notice decreases stored resources upon building creation or upgrading
  /// @param asteroidEntity ID of the asteroid to update
  /// @param resource ID of the resource to decrease
  /// @param resourceToDecrease amount of resource to be decreased
  function decreaseStoredResource(bytes32 asteroidEntity, uint8 resource, uint256 resourceToDecrease) internal {
    uint256 resourceCount = ResourceCount.get(asteroidEntity, resource);
    uint256 newResourceCount = resourceCount < resourceToDecrease ? 0 : resourceCount - resourceToDecrease;
    ResourceCount.set(asteroidEntity, resource, newResourceCount);
  }

  function checkedDecreaseStoredResource(bytes32 asteroidEntity, uint8 resource, uint256 resourceToDecrease) internal {
    uint256 resourceCount = ResourceCount.get(asteroidEntity, resource);
    require(resourceCount >= resourceToDecrease, "[StorageUsage] not enough resources to decrease");
    ResourceCount.set(asteroidEntity, resource, resourceCount - resourceToDecrease);
  }

  /// @notice increases stored resources upon building creation or upgrading
  /// @param asteroidEntity ID of the asteroid to update
  /// @param resource ID of the resource to increase
  /// @param resourceToAdd amount of resource to be increased
  function increaseStoredResource(bytes32 asteroidEntity, uint8 resource, uint256 resourceToAdd) internal {
    uint256 resourceCount = ResourceCount.get(asteroidEntity, resource);
    uint256 maxResources = MaxResourceCount.get(asteroidEntity, resource);
    uint256 newResourceCount = LibMath.min(resourceCount + resourceToAdd, maxResources);
    ResourceCount.set(asteroidEntity, resource, newResourceCount);
  }

  function checkedIncreaseStoredResource(bytes32 asteroidEntity, uint8 resource, uint256 resourceToAdd) internal {
    uint256 resourceCount = ResourceCount.get(asteroidEntity, resource);
    uint256 maxResources = MaxResourceCount.get(asteroidEntity, resource);
    require(resourceCount + resourceToAdd <= maxResources, "[StorageUsage] not enough storage to increase usage");
    ResourceCount.set(asteroidEntity, resource, resourceCount + resourceToAdd);
  }

  /// @notice sets the max storage of a resource
  /// @param asteroidEntity ID of the  asteroid to update
  /// @param resource ID of the resource to increase
  /// @param newMaxStorage amount of max storage resource to be set
  function setMaxStorage(bytes32 asteroidEntity, uint8 resource, uint256 newMaxStorage) internal {
    MaxResourceCount.set(asteroidEntity, resource, newMaxStorage);
    uint256 asteroidResourceAmount = ResourceCount.get(asteroidEntity, resource);
    if (asteroidResourceAmount > newMaxStorage) {
      ResourceCount.set(asteroidEntity, resource, newMaxStorage);
    }
  }

  /* ---------------------------- Utility Resources --------------------------- */

  /// @notice increases the max storage of a utility
  /// @param asteroidEntity ID of the  asteroid to update
  /// @param resource ID of the utility to increase
  /// @param amountToIncrease of max storage to be set
  function increaseMaxUtility(bytes32 asteroidEntity, uint8 resource, uint256 amountToIncrease) internal {
    uint256 prevMax = MaxResourceCount.get(asteroidEntity, resource);
    setMaxStorage(asteroidEntity, resource, prevMax + amountToIncrease);
  }

  /// @notice increases the max storage of a utility
  /// @param asteroidEntity ID of the  asteroid to update
  /// @param resource ID of the resource to decrease
  /// @param amountToDecrease of max storage to be set
  function decreaseMaxUtility(bytes32 asteroidEntity, uint8 resource, uint256 amountToDecrease) internal {
    uint256 maxUtility = MaxResourceCount.get(asteroidEntity, resource);
    if (maxUtility < amountToDecrease) {
      MaxResourceCount.set(asteroidEntity, resource, 0);
      return;
    }
    setMaxStorage(asteroidEntity, resource, maxUtility - amountToDecrease);
  }
}
