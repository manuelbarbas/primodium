// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID, MinerID } from "../prototypes/Tiles.sol";

import { BasicMinerID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { LibDebug } from "libraries/LibDebug.sol";

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";


library LibBuilding {

    function checkBuildCountLimit(Uint256Component buildingLimitComponent,Uint256Component buildingComponent, Uint256Component ownedByComponent,Uint256Component tileComponent, uint256 playerEntity) internal view returns (bool)
    {
        uint256 mainBuildingLevel = getMainBuildingLevelforPlayer(buildingComponent, ownedByComponent, tileComponent, playerEntity);
        uint256 buildCountLimit = getBuildCountLimit(buildingLimitComponent,mainBuildingLevel);
        uint256 buildingCount = getNumberOfBuildingsForPlayer(buildingComponent, ownedByComponent,tileComponent, playerEntity);
        return buildingCount < buildCountLimit;
    }

    function getMainBuildingLevelforPlayer(Uint256Component buildingComponent, Uint256Component ownedByComponent,Uint256Component tileComponent, uint256 playerEntity) internal view returns (uint256)
    {
        uint256[] memory ownedTiles = ownedByComponent.getEntitiesWithValue(playerEntity);
        for (uint256 i = 0; i < ownedTiles.length; i++) 
        {
            if(tileComponent.has(ownedTiles[i]) && tileComponent.getValue(ownedTiles[i]) == MainBaseID )
            {
                return buildingComponent.getValue(ownedTiles[i]);
            }
        }
        return 0;
    }


    function getNumberOfBuildingsForPlayer(BoolComponent ignoreBuildLimitComponent,Uint256Component buildingComponent,
     Uint256Component ownedByComponent,Uint256Component tileComponent, uint256 playerEntity) internal view returns (uint256)
    {
        uint256 buildingCount = 0;
        uint256[] memory ownedTiles = ownedByComponent.getEntitiesWithValue(playerEntity);
        for (uint256 i = 0; i < ownedTiles.length; i++) 
        {
            if(buildingComponent.has(ownedTiles[i]) && 
            tileComponent.has(ownedTiles[i]) && 
            doesTileCountTowardsBuildingLimit(ignoreBuildLimitComponent,tileComponent.getValue(ownedTiles[i])))
            {
                buildingCount++;
            }
        }
        return buildingCount;
    }
    
    function getBuildCountLimit(Uint256Component buildingLimitComponent,uint256 mainBuildingLevel) internal view returns (uint256)
    {
        if(LibDebug.isDebug())
            return 100;
        else if(buildingLimitComponent.has(mainBuildingLevel))
            return buildingLimitComponent.getValue(mainBuildingLevel);
        else
            revert("Invalid Main Building Level");
    }

    function isMainBase(uint256 tileId) internal pure returns (bool) {
        return tileId == MainBaseID;
    }

  function doesTileCountTowardsBuildingLimit(BoolComponent ignoreBuildLimitComponent,uint256 tileId) internal pure returns (bool) {
    return ignoreBuildLimitComponent.has(tileId);
  }

  
}
