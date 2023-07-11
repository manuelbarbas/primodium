pragma solidity >=0.8.0;
// Production Buildings
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";

library LibStorageUpdate {
  function updateStorageCapacityOfResourceForEntity(
    Uint256ArrayComponent storageCapacityResourcesComponent,
    Uint256Component storageCapacityComponent,
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
