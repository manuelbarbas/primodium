pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { LibStorage } from "libraries/LibStorage.sol";

library LibStorageUpdate {
  function updateStorageCapacityOfResourceForEntity(
    StorageCapacityResourcesComponent storageCapacityResourcesComponent,
    StorageCapacityComponent storageCapacityComponent,
    uint256 entity,
    uint256 resourceId,
    uint256 newStorageCapacity
  ) internal {
    uint256 resourceEntity = LibEncode.hashKeyEntity(resourceId, entity);
    if (!storageCapacityComponent.has(resourceEntity)) {
      uint256[] memory storageResourceIds;
      if (storageCapacityResourcesComponent.has(entity)) {
        {
          storageResourceIds = storageCapacityResourcesComponent.getValue(entity);
          uint256[] memory updatedResourceIds = new uint256[](storageResourceIds.length + 1);
          for (uint256 i = 0; i < storageResourceIds.length; i++) {
            updatedResourceIds[i] = storageResourceIds[i];
          }
          updatedResourceIds[storageResourceIds.length] = resourceId;
          storageCapacityResourcesComponent.set(entity, updatedResourceIds);
        }
      } else {
        storageResourceIds = new uint256[](1);
        storageResourceIds[0] = resourceId;
        storageCapacityResourcesComponent.set(entity, storageResourceIds);
      }
    }
    storageCapacityComponent.set(resourceEntity, newStorageCapacity);
  }
}
