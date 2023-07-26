// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxStorageResourcesComponent, ID as MaxStorageResourcesComponentID } from "components/MaxStorageResourcesComponent.sol";
import { LibStorage } from "libraries/LibStorage.sol";

library LibStorageUpdate {
  function updateMaxStorageOfResourceForEntity(
    MaxStorageResourcesComponent maxStorageResourcesComponent,
    MaxStorageComponent maxStorageComponent,
    uint256 entity,
    uint256 resourceId,
    uint32 newMaxStorage
  ) internal {
    uint256 resourceEntity = LibEncode.hashKeyEntity(resourceId, entity);
    if (!maxStorageComponent.has(resourceEntity)) {
      uint256[] memory storageResourceIds;
      if (maxStorageResourcesComponent.has(entity)) {
        storageResourceIds = maxStorageResourcesComponent.getValue(entity);
        uint256[] memory updatedResourceIds = new uint256[](storageResourceIds.length + 1);
        for (uint256 i = 0; i < storageResourceIds.length; i++) {
          updatedResourceIds[i] = storageResourceIds[i];
        }
        updatedResourceIds[storageResourceIds.length] = resourceId;
        maxStorageResourcesComponent.set(entity, updatedResourceIds);
      } else {
        storageResourceIds = new uint256[](1);
        storageResourceIds[0] = resourceId;
        maxStorageResourcesComponent.set(entity, storageResourceIds);
      }
    }
    maxStorageComponent.set(resourceEntity, newMaxStorage);
  }
}
