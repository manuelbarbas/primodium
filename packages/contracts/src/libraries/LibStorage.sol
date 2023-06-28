pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID, MinerID } from "../prototypes/Tiles.sol";

import { BasicMinerID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { LibDebug } from "libraries/LibDebug.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";

library LibStorage {
  function setEntityStorageCapacityForResource(
    Uint256Component storageComponent,
    uint256 entity,
    uint256 resourceId,
    uint256 storageCapacity
  ) internal {
    storageComponent.set(LibEncode.hashKeyEntity(resourceId, entity), storageCapacity);
  }

  function checkAndUpdatePlayerStorageAfterBuild(
    Uint256Component storageComponent,
    Uint256ArrayComponent storageResourceComponent,
    uint256 playerEntity,
    uint256 buildingId
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(buildingId, 1);
    if (!storageResourceComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageResourceComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = getEntityStorageCapacityForResource(
        storageComponent,
        playerResourceStorageEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = getEntityStorageCapacityForResource(
        storageComponent,
        buildingIdLevel,
        storageResources[i]
      );
      storageComponent.set(playerResourceStorageEntity, playerResourceStorageCapacity + storageCapacityIncrease);
    }
  }

  function checkAndUpdatePlayerStorageAfterUpgrade(
    Uint256Component storageComponent,
    Uint256ArrayComponent storageResourceComponent,
    uint256 playerEntity,
    uint256 buildingId,
    uint256 newBuildingLevel
  ) internal {
    uint256 buildingIdNewLevel = LibEncode.hashFromKey(buildingId, newBuildingLevel);
    uint256 buildingIdOldLevel = LibEncode.hashFromKey(buildingId, newBuildingLevel - 1);
    if (!storageResourceComponent.has(buildingIdNewLevel)) return;
    uint256[] memory storageResources = storageResourceComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = getEntityStorageCapacityForResource(
        storageComponent,
        playerResourceStorageEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = getEntityStorageCapacityForResource(
        storageComponent,
        buildingIdNewLevel,
        storageResources[i]
      ) -
        (
          storageResourceComponent.has(buildingIdOldLevel)
            ? getEntityStorageCapacityForResource(storageComponent, buildingIdOldLevel, storageResources[i])
            : 0
        );
      storageComponent.set(playerResourceStorageEntity, playerResourceStorageCapacity + storageCapacityIncrease);
    }
  }

  function checkAndUpdatePlayerStorageAfterDestroy(
    Uint256Component storageComponent,
    Uint256ArrayComponent storageResourceComponent,
    Uint256Component itemComponent,
    uint256 playerEntity,
    uint256 buildingId,
    uint256 buildingLevel
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(buildingId, buildingLevel);
    if (!storageResourceComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageResourceComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = getEntityStorageCapacityForResource(
        storageComponent,
        playerResourceStorageEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = getEntityStorageCapacityForResource(
        storageComponent,
        buildingIdLevel,
        storageResources[i]
      );
      storageComponent.set(playerResourceStorageEntity, playerResourceStorageCapacity - storageCapacityIncrease);
      uint256 playerResourceAmount = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(storageResources[i], playerEntity)
      );
      if (playerResourceAmount > playerResourceStorageCapacity) {
        itemComponent.set(
          LibEncode.hashKeyEntity(storageResources[i], playerEntity),
          playerResourceStorageCapacity - storageCapacityIncrease
        );
      }
    }
  }

  function getBuildingIdLevelStorageCapacityForResource(
    Uint256Component storageComponent,
    uint256 buildingId,
    uint256 level,
    uint256 resourceId
  ) internal view returns (uint256) {
    return getEntityStorageCapacityForResource(storageComponent, LibEncode.hashFromKey(buildingId, level), resourceId);
  }

  function getAvailableSpaceInStorageForResource(
    Uint256Component storageComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint256) {
    return
      getEntityStorageCapacityForResource(storageComponent, entity, resourceId) -
      LibMath.getSafeUint256Value(itemComponent, LibEncode.hashKeyEntity(resourceId, entity));
  }

  function getEntityStorageCapacityForResource(
    Uint256Component storageComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint256) {
    return LibMath.getSafeUint256Value(storageComponent, LibEncode.hashKeyEntity(resourceId, entity));
  }

  function getStorageCapacityForBuildingForResource(
    Uint256Component storageComponent,
    Uint256Component buildingComponent,
    uint256 buildingEntity,
    uint256 buildingId,
    uint256 resourceId
  ) internal view returns (uint256) {
    return
      getBuildingIdLevelStorageCapacityForResource(
        storageComponent,
        buildingId,
        buildingComponent.getValue(buildingEntity),
        resourceId
      );
  }

  function addResourceToStorage(
    Uint256Component itemComponent,
    Uint256Component storageComponent,
    uint256 resourceId,
    uint256 resourceAmount,
    uint256 playerEntity
  ) internal returns (uint256) {
    uint256 currentStorage = getEntityStorageCapacityForResource(storageComponent, playerEntity, resourceId);
    uint256 currentStoredAmount = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(resourceId, playerEntity)
    );
    if (currentStoredAmount + resourceAmount > currentStorage) {
      uint256 amountToStore = currentStorage - currentStoredAmount;
      itemComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), currentStoredAmount + amountToStore);
      return resourceAmount - amountToStore;
    }
    itemComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), currentStoredAmount + resourceAmount);
    return 0;
  }
}
