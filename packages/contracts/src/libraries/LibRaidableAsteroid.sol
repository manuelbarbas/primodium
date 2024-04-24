// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { OwnedBy, Asteroid, PositionData, MaxResourceCount, P_Unit, UnitCount, DroidRegenTimestamp } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { StorageUnitPrototypeId, IronMinePrototypeId, CopperMinePrototypeId, LithiumMinePrototypeId, IronPlateFactoryPrototypeId, AlloyFactoryPrototypeId, PVCellFactoryPrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";
import { EResource } from "src/Types.sol";

library LibRaidableAsteroid {
  function buildRaidableAsteroid(bytes32 asteroidEntity) internal {
    // get max level to determine if common1 (maxLevel: 1) or common2 (maxLevel: 3)
    uint256 maxLevel = Asteroid.getMaxLevel(asteroidEntity);
    int32 x;
    int32 y;

    // build one storage building
    LibBuilding.uncheckedBuild(bytes32(0), StorageUnitPrototypeId, PositionData(21, 15, asteroidEntity));

    // fill storage with max common resources
    uint256 resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Iron));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Iron), resourceMax);

    resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Copper));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Copper), resourceMax);

    resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Lithium));
    LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Lithium), resourceMax);

    // build each mine type
    LibBuilding.uncheckedBuild(bytes32(0), IronMinePrototypeId, PositionData(23, 16, asteroidEntity));
    LibBuilding.uncheckedBuild(bytes32(0), CopperMinePrototypeId, PositionData(23, 15, asteroidEntity));
    LibBuilding.uncheckedBuild(bytes32(0), LithiumMinePrototypeId, PositionData(23, 14, asteroidEntity));

    // if common2, add max advanced resources and build each factory type
    if (maxLevel >= 3) {
      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.IronPlate));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.IronPlate), resourceMax);

      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.Alloy));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.Alloy), resourceMax);

      resourceMax = MaxResourceCount.get(asteroidEntity, uint8(EResource.PVCell));
      LibStorage.checkedIncreaseStoredResource(asteroidEntity, uint8(EResource.PVCell), resourceMax);

      LibBuilding.uncheckedBuild(bytes32(0), IronPlateFactoryPrototypeId, PositionData(19, 15, asteroidEntity));
      LibBuilding.uncheckedBuild(bytes32(0), AlloyFactoryPrototypeId, PositionData(17, 15, asteroidEntity));
      LibBuilding.uncheckedBuild(bytes32(0), PVCellFactoryPrototypeId, PositionData(15, 15, asteroidEntity));
    }

    // max droid units are already added in separate function, just init timestamp
    DroidRegenTimestamp.set(asteroidEntity, block.timestamp);
  }

  // modifier for claiming raidable asteroid units
  // make sure it is an asteroid
  // make sure it is owned by 0x0
  // getSecondaryAsteroidUnitsAndEncryption to get max droids
  // build droids over time until max droids
  function claimRaidableUnits(bytes32 asteroidEntity) internal {
    if (!Asteroid.getIsAsteroid(asteroidEntity) || OwnedBy.get(asteroidEntity) != bytes32(0)) {
      return;
    }
    if (Asteroid.getMapId(asteroidEntity) != 7) {
      return;
    }

    (uint256 maxDroidCount, ) = LibAsteroid.getSecondaryAsteroidUnitsAndEncryption(
      Asteroid.getMaxLevel(asteroidEntity)
    );
    uint256 droidTrainingTime = P_Unit.getTrainingTime(DroidPrototypeId, 1);
    uint256 currentDroidCount = UnitCount.get(asteroidEntity, DroidPrototypeId);
    uint256 timeSinceLastClaimed = block.timestamp - DroidRegenTimestamp.get(asteroidEntity);
    uint256 droidClaimRemainder;
    if (droidTrainingTime != 0) {
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
