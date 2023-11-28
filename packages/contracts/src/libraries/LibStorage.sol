// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { OwnedBy, P_ListMaxResourceUpgrades, P_ByLevelMaxResourceUpgrades, MaxResourceCount, Level, ResourceCount, BuildingType } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";

library LibStorage {
  /// @notice Increases the max storage of resources based on building prototype data
  /// @notice uses P_ByLevelMaxResourceUpgrades and P_LisMaxResourceUpgrades to track storage upgrades
  /// @param buildingEntity ID of the building to update
  /// @param level of the building to pull prototype data from
  function increaseMaxStorage(bytes32 buildingEntity, uint256 level) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint8 resource = (storageResources[i]);
      uint256 maxResource = MaxResourceCount.get(spaceRockEntity, resource);
      uint256 maxResourceIncrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      if (level > 1) {
        maxResourceIncrease -= P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level - 1);
      }
      setMaxStorage(spaceRockEntity, resource, maxResource + maxResourceIncrease);
    }
  }

  /// @notice clears max storage increase upon destroying a builing
  /// @param buildingEntity ID of the building to clear
  function clearMaxStorageIncrease(bytes32 buildingEntity) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint8 i = 0; i < storageResources.length; i++) {
      uint8 resource = storageResources[i];
      uint256 maxResource = MaxResourceCount.get(spaceRockEntity, resource);
      uint256 maxResourceDecrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      require(maxResource >= maxResourceDecrease, "[StorageUsage] not enough storage to reduce usage");
      setMaxStorage(spaceRockEntity, resource, maxResource - maxResourceDecrease);
    }
  }

  /* -------------------------- Non-Utility Resources ------------------------- */
  /// @notice decreases stored resources upon building creation or upgrading
  /// @param spaceRockEntity ID of the spaceRock to update
  /// @param resource ID of the resource to decrease
  /// @param resourceToDecrease amount of resource to be decreased
  function decreaseStoredResource(
    bytes32 spaceRockEntity,
    uint8 resource,
    uint256 resourceToDecrease
  ) internal {
    uint256 resourceCount = ResourceCount.get(spaceRockEntity, resource);
    uint256 newResourceCount = resourceCount < resourceToDecrease ? 0 : resourceCount - resourceToDecrease;
    ResourceCount.set(spaceRockEntity, resource, newResourceCount);
  }

  /// @notice increases stored resources upon building creation or upgrading
  /// @param spaceRockEntity ID of the spaceRock to update
  /// @param resource ID of the resource to increase
  /// @param resourceToAdd amount of resource to be increased
  function increaseStoredResource(
    bytes32 spaceRockEntity,
    uint8 resource,
    uint256 resourceToAdd
  ) internal {
    uint256 resourceCount = ResourceCount.get(spaceRockEntity, resource);
    uint256 maxResources = MaxResourceCount.get(spaceRockEntity, resource);
    uint256 newResourceCount = LibMath.min(resourceCount + resourceToAdd, maxResources);
    ResourceCount.set(spaceRockEntity, resource, newResourceCount);
  }

  /// @notice sets the max storage of a resource
  /// @param spaceRockEntity ID of the  spaceRock to update
  /// @param resource ID of the resource to increase
  /// @param newMaxStorage amount of max storage resource to be set
  function setMaxStorage(
    bytes32 spaceRockEntity,
    uint8 resource,
    uint256 newMaxStorage
  ) internal {
    MaxResourceCount.set(spaceRockEntity, resource, newMaxStorage);
    uint256 spaceRockResourceAmount = ResourceCount.get(spaceRockEntity, resource);
    if (spaceRockResourceAmount > newMaxStorage) {
      ResourceCount.set(spaceRockEntity, resource, newMaxStorage);
    }
  }

  /* ---------------------------- Utility Resources --------------------------- */

  /// @notice increases the max storage of a utility
  /// @param spaceRockEntity ID of the  spaceRock to update
  /// @param resource ID of the utility to increase
  /// @param amountToIncrease of max storage to be set
  function increaseMaxUtility(
    bytes32 spaceRockEntity,
    uint8 resource,
    uint256 amountToIncrease
  ) internal {
    uint256 prevMax = MaxResourceCount.get(spaceRockEntity, resource);
    setMaxStorage(spaceRockEntity, resource, prevMax + amountToIncrease);
  }

  /// @notice increases the max storage of a utility
  /// @param spaceRockEntity ID of the  spaceRock to update
  /// @param resource ID of the resource to decrease
  /// @param amountToDecrease of max storage to be set
  function decreaseMaxUtility(
    bytes32 spaceRockEntity,
    uint8 resource,
    uint256 amountToDecrease
  ) internal {
    uint256 maxUtility = MaxResourceCount.get(spaceRockEntity, resource);
    if (maxUtility < amountToDecrease) {
      MaxResourceCount.set(spaceRockEntity, resource, 0);
      return;
    }
    setMaxStorage(spaceRockEntity, resource, maxUtility - amountToDecrease);
  }
}
