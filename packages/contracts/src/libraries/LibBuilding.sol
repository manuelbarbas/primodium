// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";

import { BasicMinerID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

library LibBuilding {

    function getBuildCountLimit(uint256 mainBuildingLevel) internal pure returns (uint256)
    {
        if(mainBuildingLevel == 1)
            return 5;
        else if(mainBuildingLevel == 2)
            return 10;
        else if(mainBuildingLevel == 3)
            return 15;
        return 0;
    }

    function isMainBase(uint256 tileId) internal pure returns (bool) {
        return tileId == MainBaseID;
    }

  function isBuilding(uint256 tileId) internal pure returns (bool) {
    return
      // debug
      tileId == SiloID ||
      tileId == BulletFactoryID ||
      tileId == DebugPlatingFactoryID ||
      // production
      tileId == PlatingFactoryID ||
      tileId == BasicBatteryFactoryID ||
      tileId == KineticMissileFactoryID ||
      tileId == ProjectileLauncherID ||
      tileId == HardenedDrillID ||
      tileId == DenseMetalRefineryID ||
      tileId == AdvancedBatteryFactoryID ||
      tileId == HighTempFoundryID ||
      tileId == PrecisionMachineryFactoryID ||
      tileId == IridiumDrillbitFactoryID ||
      tileId == PrecisionPneumaticDrillID ||
      tileId == PenetratorFactoryID ||
      tileId == PenetratingMissileFactoryID ||
      tileId == MissileLaunchComplexID ||
      tileId == HighEnergyLaserFactoryID ||
      tileId == ThermobaricWarheadFactoryID ||
      tileId == ThermobaricMissileFactoryID ||
      tileId == KimberliteCatalystFactoryID;
  }

  
}
