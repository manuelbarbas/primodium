// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { OwnedBy, Asteroid, PositionData } from "codegen/index.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { StorageUnitPrototypeId, IronMinePrototypeId, CopperMinePrototypeId, LithiumMinePrototypeId, IronPlateFactoryPrototypeId, AlloyFactoryPrototypeId, PVCellFactoryPrototypeId } from "codegen/Prototypes.sol";

library LibRaidableAsteroid {
  function buildRaidableAsteroid(bytes32 asteroidEntity) internal {
    // get max level to determine if common1 (maxLevel: 1) or common2 (maxLevel: 3)
    uint256 maxLevel = Asteroid.getMaxLevel(asteroidEntity);
    int32 x;
    int32 y;

    // // build one storage building
    LibBuilding.uncheckedBuild(bytes32(0), StorageUnitPrototypeId, PositionData(18, 14, asteroidEntity));

    // build each mine type
    LibBuilding.uncheckedBuild(bytes32(0), IronMinePrototypeId, PositionData(20, 14, asteroidEntity));
    LibBuilding.uncheckedBuild(bytes32(0), CopperMinePrototypeId, PositionData(20, 15, asteroidEntity));
    LibBuilding.uncheckedBuild(bytes32(0), LithiumMinePrototypeId, PositionData(21, 14, asteroidEntity));

    // // if common2, build each factory type
    // if(maxLevel >= 3) {
    //   LibBuilding.uncheckedBuild(bytes32(0), IronPlateFactoryPrototypeId, PositionData(x, y, asteroidEntity));
    //   LibBuilding.uncheckedBuild(bytes32(0), AlloyFactoryPrototypeId, PositionData(x, y, asteroidEntity));
    //   LibBuilding.uncheckedBuild(bytes32(0), PVCellFactoryPrototypeId, PositionData(x, y, asteroidEntity));
    // }
  }

  // modifier for claiming raidable asteroid units
  // make sure it is owned by 0x0
  // get max level
  // getSecondaryAsteroidUnitsAndEncryption to get max droids
  // build droids over time until max droids
}
