pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxStorageResourcesComponent, ID as MaxStorageResourcesComponentID } from "components/MaxStorageResourcesComponent.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibStorageUpdate } from "libraries/LibStorageUpdate.sol";

library LibStorageUpgrade {
  function checkAndUpdatePlayerStorageAfterUpgrade(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingId,
    uint32 newLevel
  ) internal {
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(world.getComponent(MaxStorageComponentID));
    MaxStorageResourcesComponent maxStorageResourcesComponent = MaxStorageResourcesComponent(
      world.getComponent(MaxStorageResourcesComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingId, newLevel);
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingId, newLevel - 1);
    if (!maxStorageResourcesComponent.has(buildingIdNewLevel)) return;

    uint256[] memory storageResources = maxStorageResourcesComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        playerEntity,
        storageResources[i]
      );

      uint32 maxStorageIncrease = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        buildingIdNewLevel,
        storageResources[i]
      ) -
        (
          maxStorageResourcesComponent.has(buildingIdOldLevel)
            ? LibStorage.getEntityMaxStorageForResource(maxStorageComponent, buildingIdOldLevel, storageResources[i])
            : 0
        );

      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        maxStorageResourcesComponent,
        maxStorageComponent,
        playerEntity,
        storageResources[i],
        playerResourceMaxStorage + maxStorageIncrease
      );
    }
  }
}
