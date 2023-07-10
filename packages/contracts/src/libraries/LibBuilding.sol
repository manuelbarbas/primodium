// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID, MinerID } from "../prototypes/Tiles.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

//components
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { MainBaseID, BasicMinerID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibMath } from "libraries/LibMath.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { LibTerrain } from "./LibTerrain.sol";
import { LibEncode } from "./LibEncode.sol";

library LibBuilding {
  function isBuildLimitMet(
    BoolComponent ignoreBuildLimitComponent,
    Uint256Component buildingLimitComponent,
    Uint256Component buildingComponent,
    uint256 playerEntity,
    uint256 buildingId
  ) internal view returns (bool) {
    return
      ignoreBuildLimitComponent.has(buildingId) ||
      isBuildingCountWithinLimit(buildingLimitComponent, buildingComponent, playerEntity);
  }

  function isBuildingCountWithinLimit(
    Uint256Component buildingLimitComponent,
    Uint256Component buildingComponent,
    uint256 playerEntity
  ) internal view returns (bool) {
    uint256 mainBuildingLevel = getMainBuildingLevelforPlayer(buildingComponent, playerEntity);
    uint256 buildCountLimit = getBuildCountLimit(buildingLimitComponent, mainBuildingLevel);
    uint256 buildingCount = getNumberOfBuildingsForPlayer(buildingLimitComponent, playerEntity);
    return buildingCount < buildCountLimit;
  }

  function canBuildOnTile(
    Uint256Component tileComponent,
    uint256 buildingEntity,
    Coord memory coord
  ) internal view returns (bool) {
    return
      !tileComponent.has(buildingEntity) || tileComponent.getValue(buildingEntity) == LibTerrain.getTopLayerKey(coord);
  }

  function getMainBuildingLevelforPlayer(
    Uint256Component buildingComponent,
    uint256 playerEntity
  ) internal view returns (uint256) {
    return
      buildingComponent.has(playerEntity) ? buildingComponent.getValue(buildingComponent.getValue(playerEntity)) : 0;
  }

  function getNumberOfBuildingsForPlayer(
    Uint256Component buildingLimitComponent,
    uint256 playerEntity
  ) internal view returns (uint256) {
    return LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity);
  }

  function getBuildCountLimit(
    Uint256Component buildingLimitComponent,
    uint256 mainBuildingLevel
  ) internal view returns (uint256) {
    if (buildingLimitComponent.has(mainBuildingLevel)) return buildingLimitComponent.getValue(mainBuildingLevel);
    else revert("Invalid Main Building Level");
  }

  function isMainBase(uint256 tileId) internal pure returns (bool) {
    return tileId == MainBaseID;
  }

  function checkResearchReqs(IWorld world, uint256 blockType) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(world.components(), ResearchComponentID));
    return
      LibResearch.checkResearchRequirements(
        requiredResearchComponent,
        researchComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkResourceReqs(IWorld world, uint256 blockType) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    return
      LibResourceCost.hasRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkAndSpendResourceReqs(IWorld world, uint256 blockType) internal returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    return
      LibResourceCost.checkAndSpendRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }
}
