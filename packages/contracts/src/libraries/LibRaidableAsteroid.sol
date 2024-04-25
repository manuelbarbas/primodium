// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { OwnedBy, Asteroid, PositionData, MaxResourceCount, P_Unit, UnitCount, DroidRegenTimestamp } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { StorageUnitPrototypeId, IronMinePrototypeId, CopperMinePrototypeId, LithiumMinePrototypeId, IronPlateFactoryPrototypeId, AlloyFactoryPrototypeId, PVCellFactoryPrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";
import { EResource } from "src/Types.sol";

library LibRaidableAsteroid {
  /**
   * @notice Initializes a secondary asteroid as a raidable asteroid
   * @dev Takes a secondary asteroid and constructs the necessary buildings, initializes resources, and initializes droids to be raidable.
   * @param asteroidEntity Entity ID of the raidable asteroid
   */
  function buildRaidableAsteroid(bytes32 asteroidEntity) internal {
    // get max level to determine if common1 (maxLevel: 1) or common2 (maxLevel: 3)
    uint256 maxLevel = Asteroid.getMaxLevel(asteroidEntity);
    bytes32 buildingEntity;
    int32 x;
    int32 y;

    // build one storage building
    buildingEntity = LibBuilding.uncheckedBuild(
      bytes32(0),
      StorageUnitPrototypeId,
      PositionData(21, 15, asteroidEntity)
    );
    LibStorage.increaseMaxStorage(buildingEntity, 1);

    // fill storage with max common resources
    uint256 resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Iron));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Iron), resourceMax);

    resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Copper));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Copper), resourceMax);

    resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Lithium));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Lithium), resourceMax);

    // build each mine type
    buildingEntity = LibBuilding.uncheckedBuild(bytes32(0), IronMinePrototypeId, PositionData(23, 16, asteroidEntity));
    LibProduction.upgradeResourceProduction(buildingEntity, 1);
    buildingEntity = LibBuilding.uncheckedBuild(
      bytes32(0),
      CopperMinePrototypeId,
      PositionData(23, 15, asteroidEntity)
    );
    LibProduction.upgradeResourceProduction(buildingEntity, 1);
    buildingEntity = LibBuilding.uncheckedBuild(
      bytes32(0),
      LithiumMinePrototypeId,
      PositionData(23, 14, asteroidEntity)
    );
    LibProduction.upgradeResourceProduction(buildingEntity, 1);

    // if common2, add max advanced resources and build each factory type
    if (maxLevel >= 3) {
      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.IronPlate));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.IronPlate), resourceMax);

      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Alloy));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Alloy), resourceMax);

      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.PVCell));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.PVCell), resourceMax);

      buildingEntity = LibBuilding.uncheckedBuild(
        bytes32(0),
        IronPlateFactoryPrototypeId,
        PositionData(19, 15, asteroidEntity)
      );
      LibProduction.upgradeResourceProduction(buildingEntity, 1);
      buildingEntity = LibBuilding.uncheckedBuild(
        bytes32(0),
        AlloyFactoryPrototypeId,
        PositionData(17, 15, asteroidEntity)
      );
      LibProduction.upgradeResourceProduction(buildingEntity, 1);
      buildingEntity = LibBuilding.uncheckedBuild(
        bytes32(0),
        PVCellFactoryPrototypeId,
        PositionData(15, 15, asteroidEntity)
      );
      LibProduction.upgradeResourceProduction(buildingEntity, 1);
    }

    // max droid units are already added in initSecondaryAsteroid(), just need to init a special timestamp
    DroidRegenTimestamp.set(asteroidEntity, block.timestamp);
  }

  /**
   * @notice Claims the droid units built on a raidable asteroid until its maximum
   * @dev This function is called by Primodium__claimUnits in the S_ClaimSystem contract
   * @param asteroidEntity Entity ID of the raidable asteroid
   */
  function claimRaidableUnits(bytes32 asteroidEntity) internal {
    if (
      !Asteroid.getIsAsteroid(asteroidEntity) ||
      OwnedBy.get(asteroidEntity) != bytes32(0) ||
      Asteroid.getMapId(asteroidEntity) != 7
    ) {
      return;
    }

    (uint256 maxDroidCount, ) = LibAsteroid.getSecondaryAsteroidUnitsAndEncryption(
      Asteroid.getMaxLevel(asteroidEntity)
    );
    uint256 droidTrainingTime = P_Unit.getTrainingTime(DroidPrototypeId, 0);
    uint256 currentDroidCount = UnitCount.get(asteroidEntity, DroidPrototypeId);
    uint256 timeSinceLastClaimed = block.timestamp - DroidRegenTimestamp.get(asteroidEntity);
    uint256 droidClaimRemainder;
    if (droidTrainingTime > 0) {
      currentDroidCount = (timeSinceLastClaimed / droidTrainingTime) + currentDroidCount;
      droidClaimRemainder = timeSinceLastClaimed % droidTrainingTime;
    } else {
      currentDroidCount = maxDroidCount;
    }
    if (currentDroidCount >= maxDroidCount) {
      currentDroidCount = maxDroidCount;
      droidClaimRemainder = 0;
    }

    UnitCount.set(asteroidEntity, DroidPrototypeId, currentDroidCount);
    DroidRegenTimestamp.set(asteroidEntity, block.timestamp - droidClaimRemainder);
  }
}
