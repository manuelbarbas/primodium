pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
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
    OwnedResourcesComponent ownedResourcesComponent = OwnedResourcesComponent(
      world.getComponent(OwnedResourcesComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingId, newLevel);
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingId, newLevel - 1);
    if (!ownedResourcesComponent.has(buildingIdNewLevel)) return;

    uint256[] memory storageResources = ownedResourcesComponent.getValue(buildingIdNewLevel);
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
          ownedResourcesComponent.has(buildingIdOldLevel)
            ? LibStorage.getEntityMaxStorageForResource(maxStorageComponent, buildingIdOldLevel, storageResources[i])
            : 0
        );

      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        ownedResourcesComponent,
        maxStorageComponent,
        playerEntity,
        storageResources[i],
        playerResourceMaxStorage + maxStorageIncrease
      );
    }
  }
}
