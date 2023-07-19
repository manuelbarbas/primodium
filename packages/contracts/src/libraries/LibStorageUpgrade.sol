pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibStorageUpdate } from "libraries/LibStorageUpdate.sol";

library LibStorageUpgrade {
  function checkAndUpdatePlayerStorageAfterUpgrade(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingId,
    uint256 newLevel
  ) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      world.getComponent(StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      world.getComponent(StorageCapacityResourcesComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingId, newLevel);
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingId, newLevel - 1);
    if (!storageCapacityResourcesComponent.has(buildingIdNewLevel)) return;

    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerEntity,
        storageResources[i]
      );

      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingIdNewLevel,
        storageResources[i]
      ) -
        (
          storageCapacityResourcesComponent.has(buildingIdOldLevel)
            ? LibStorage.getEntityStorageCapacityForResource(
              storageCapacityComponent,
              buildingIdOldLevel,
              storageResources[i]
            )
            : 0
        );

      LibStorageUpdate.updateStorageCapacityOfResourceForEntity(
        storageCapacityResourcesComponent,
        storageCapacityComponent,
        playerEntity,
        storageResources[i],
        playerResourceStorageCapacity + storageCapacityIncrease
      );
    }
  }
}
