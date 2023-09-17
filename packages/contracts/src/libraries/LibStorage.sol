// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_ListMaxResourceUpgrades, P_ByLevelMaxResourceUpgrades, MaxResourceCount, Level, ResourceCount, BuildingType } from "codegen/Tables.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibResource } from "libraries/LibResource.sol";
import { EResource } from "src/Types.sol";

library LibStorage {
  function increaseMaxStorage(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint32 level
  ) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint32 level = Level.get(buildingEntity);

    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      EResource resource = EResource(storageResources[i]);
      uint32 maxResource = MaxResourceCount.get(playerEntity, resource);
      uint32 maxResourceIncrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      if (level > 1) {
        maxResourceIncrease -= P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level - 1);
      }
      setMaxStorage(playerEntity, resource, maxResource + maxResourceIncrease);
    }
  }

  function clearMaxStorageIncrease(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint32 level = Level.get(buildingEntity);
    uint8[] memory storageResources = P_ListMaxResourceUpgrades.get(buildingType, level);
    for (uint256 i = 0; i < storageResources.length; i++) {
      EResource resource = EResource(storageResources[i]);
      uint32 maxResource = MaxResourceCount.get(playerEntity, resource);
      uint32 maxResourceDecrease = P_ByLevelMaxResourceUpgrades.get(buildingType, resource, level);
      require(maxResource >= maxResourceDecrease, "[StorageUsage] not enough storage to reduce usage");
      setMaxStorage(playerEntity, resource, maxResource - maxResourceDecrease);
    }
  }

  /* -------------------------- Non-Utility Resources ------------------------- */
  function decreaseStoredResource(
    bytes32 playerEntity,
    EResource resource,
    uint32 resourceToDecrease
  ) internal {
    uint32 resourceCount = ResourceCount.get(playerEntity, resource);
    uint32 newResourceCount = resourceCount < resourceToDecrease ? 0 : resourceCount - resourceToDecrease;
    ResourceCount.set(playerEntity, resource, newResourceCount);
  }

  function increaseStoredResource(
    bytes32 playerEntity,
    EResource resource,
    uint32 resourceToAdd
  ) internal {
    uint32 resourceCount = ResourceCount.get(playerEntity, resource);
    uint32 maxResources = MaxResourceCount.get(playerEntity, resource);
    uint32 newResourceCount = LibMath.min(resourceCount + resourceToAdd, maxResources);
    ResourceCount.set(playerEntity, resource, newResourceCount);
  }

  function setMaxStorage(
    bytes32 playerEntity,
    EResource resource,
    uint32 newMaxStorage
  ) internal {
    MaxResourceCount.set(playerEntity, resource, newMaxStorage);
    uint32 playerResourceAmount = ResourceCount.get(playerEntity, resource);
    if (playerResourceAmount > newMaxStorage) {
      ResourceCount.set(playerEntity, resource, newMaxStorage);
    }
  }

  /* ---------------------------- Utility Resources --------------------------- */

  function increaseMaxUtility(
    bytes32 playerEntity,
    EResource resource,
    uint32 amountToIncrease
  ) internal {
    uint32 prevMax = MaxResourceCount.get(playerEntity, resource);
    MaxResourceCount.set(playerEntity, resource, prevMax + amountToIncrease);
  }

  function decreaseMaxUtility(
    bytes32 playerEntity,
    EResource resource,
    uint32 amountToDecrease
  ) internal {
    uint32 maxUtility = MaxResourceCount.get(playerEntity, resource);
    if (maxUtility < amountToDecrease) {
      MaxResourceCount.set(playerEntity, resource, 0);
      return;
    }
    MaxResourceCount.set(playerEntity, resource, maxUtility - amountToDecrease);
  }
}
