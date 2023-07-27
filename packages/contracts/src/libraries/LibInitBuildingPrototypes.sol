// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
// Production Buildings
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

import { FactoryProductionComponent, ID as FactoryProductionComponentID } from "components/FactoryProductionComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, PassiveResourceProductionData } from "components/PassiveResourceProductionComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID } from "components/RequiredPassiveResourceComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";

import "../prototypes.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

uint32 constant NONE = 0;

library LibInitBuildingPrototypes {
  function initIronMine(IWorld world) internal {
    uint256 entity = IronMineID;
    uint32 maxLevel = 3;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    // no research required for level 1
    requiredResearch[1] = IronMine2ResearchID;
    requiredResearch[2] = IronMine3ResearchID;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);
    productionRates[0] = 5;
    productionRates[1] = 7;
    productionRates[2] = 10;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 800 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */

    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineComponent(world.getComponent(MineComponentID)).set(buildingLevelEntity, productionRates[i]);
      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
    }
  }

  function initCopperMine(IWorld world) internal {
    uint256 entity = CopperMineID;
    uint32 maxLevel = 3;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);

    requiredResearch[0] = CopperMineResearchID;
    requiredResearch[1] = CopperMine2ResearchID;
    requiredResearch[2] = CopperMine3ResearchID;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);

    productionRates[0] = 3;
    productionRates[1] = 5;
    productionRates[2] = 7;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineComponent(world.getComponent(MineComponentID)).set(buildingLevelEntity, productionRates[i]);
      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
    }
  }

  function initLithiumMine(IWorld world) internal {
    uint256 entity = LithiumMineID;
    uint32 maxLevel = 2;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);

    requiredResearch[0] = LithiumMineResearchID;
    requiredResearch[1] = LithiumMine2ResearchID;
    /****************** Production Rates *******************/

    uint32[] memory productionRates = new uint32[](maxLevel);

    productionRates[0] = 2;
    productionRates[1] = 3;

    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);

    /****************** Required Resources *******************/
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 700 });
    requiredResources[1] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineComponent(world.getComponent(MineComponentID)).set(buildingLevelEntity, productionRates[i]);
      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
    }
  }

  function initStorageUnit(IWorld world) internal {
    uint256 entity = StorageUnitID;
    uint32 maxLevel = 3;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);

    requiredResearch[0] = StorageUnitResearchID;
    requiredResearch[1] = StorageUnit2ResearchID;
    requiredResearch[2] = StorageUnit3ResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 400 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    /****************** Storage Updates *******************/
    ResourceValue[][] memory storageUpgrades = new ResourceValue[][](maxLevel);
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    storageUpgrades[0] = resourceValues;

    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    storageUpgrades[1] = resourceValues;

    // LEVEL 3
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 1000 });
    storageUpgrades[2] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
      LibSetBuildingReqs.setStorageUpgrades(world, entity, storageUpgrades[i]);
    }
  }

  function initIronPlateFactory(IWorld world) internal {
    uint256 entity = IronPlateFactoryID;
    uint32 maxLevel = 2;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    // no research required for level 1
    requiredResearch[0] = IronPlateFactoryResearchID;
    requiredResearch[2] = IronPlateFactory2ResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);

    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    requiredResources[1] = resourceValues;

    /****************** Required Mines *******************/
    uint256[] memory mineIds = new uint256[](2);
    /****************** Factory Production *******************/

    /* ***********************Set Values ************************* */

    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
    }
  }

  function init(IWorld world) internal {
    initIronMine(world);
    initCopperMine(world);
  }
}
