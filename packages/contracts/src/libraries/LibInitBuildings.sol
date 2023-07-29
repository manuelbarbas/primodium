// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
// Production Buildings
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID, ResourceValue } from "components/PassiveProductionComponent.sol";
import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "components/MinesComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

import "../prototypes.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

uint32 constant NONE = 0;

library LibInitBuildings {
  function init(IWorld world) internal {
    // main base
    initMainBase(world);

    // mines
    initIronMine(world);
    initCopperMine(world);
    initLithiumMine(world);

    // factories
    initIronPlateFactory(world);
    initAlloyFactory(world);
    initLi2CuO2Factory(world);

    // special
    initStorageUnit(world);
    initSolarPanel(world);
  }

  function initMainBase(IWorld world) internal {
    uint256 entity = MainBaseID;
    uint32 maxLevel = 6;

    IgnoreBuildLimitComponent(world.getComponent(IgnoreBuildLimitComponentID)).set(MainBaseID);
    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);

    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](0);
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 800 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 800 });
    requiredResources[2] = resourceValues;
    //LEVEL 4
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 800 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 800 });
    resourceValues[1] = ResourceValue({ resource: LithiumResourceItemID, value: 800 });
    requiredResources[4] = resourceValues;
    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[5] = resourceValues;

    /****************** Storage Upgrades *******************/
    ResourceValue[][] memory storageUpgrades = new ResourceValue[][](maxLevel);
    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1000 });
    storageUpgrades[0] = resourceValues;

    // LEVEL 2
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    storageUpgrades[1] = resourceValues;

    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2500 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 2500 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    storageUpgrades[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 4000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 4000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2500 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 1500 });
    storageUpgrades[3] = resourceValues;

    // LEVEL 5
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 4000 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 4000 });
    storageUpgrades[4] = resourceValues;

    // LEVEL 5
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 4000 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 4000 });
    storageUpgrades[5] = resourceValues;
    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get3x3Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      LibSetBuildingReqs.setStorageUpgrades(world, buildingLevelEntity, storageUpgrades[i]);
    }
  }

  /******************************** Mines ********************************** */

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
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](0);
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 800 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */

    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, IronResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineProductionComponent(world.getComponent(MineProductionComponentID)).set(
        buildingLevelEntity,
        productionRates[i]
      );
      if (requiredResearch[i] > 0)
        RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
          buildingLevelEntity,
          requiredResearch[i]
        );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
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
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, CopperResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineProductionComponent(world.getComponent(MineProductionComponentID)).set(
        buildingLevelEntity,
        productionRates[i]
      );
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

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 700 });
    requiredResources[1] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(entity, LithiumResourceItemID);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      MineProductionComponent(world.getComponent(MineProductionComponentID)).set(
        buildingLevelEntity,
        productionRates[i]
      );
      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
    }
  }

  /****************************** Factories ******************************** */

  function initIronPlateFactory(IWorld world) internal {
    uint256 entity = IronPlateFactoryID;
    uint32 maxLevel = 2;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    requiredResearch[0] = IronPlateFactoryResearchID;
    requiredResearch[1] = IronPlateFactory2ResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);

    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    requiredResources[1] = resourceValues;

    /****************** Required Mines *******************/
    ResourceValues[] memory requiredMines = new ResourceValues[](maxLevel);
    // LEVEL 1
    uint256[] memory mineIds = new uint256[](1);
    uint32[] memory mineCounts = new uint32[](1);
    mineIds[0] = IronMineID;
    mineCounts[0] = 1;
    requiredMines[0] = ResourceValues(mineIds, mineCounts);
    // LEVEL 2
    mineIds[0] = IronMineID;
    mineCounts[0] = 1;
    requiredMines[1] = ResourceValues(mineIds, mineCounts);

    /****************** Factory Production *******************/
    ResourceValue[] memory production = new ResourceValue[](maxLevel);
    // LEVEL 1

    uint256 resourceIds = IronPlateCraftedItemID;
    uint32 rates = 2;
    production[0] = ResourceValue(resourceIds, rates);
    // LEVEL 2
    resourceIds = IronPlateCraftedItemID;
    rates = 4;
    production[1] = ResourceValue(resourceIds, rates);

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
      MinesComponent(world.getComponent(MinesComponentID)).set(buildingLevelEntity, requiredMines[i]);
      ProductionComponent(world.getComponent(ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  function initAlloyFactory(IWorld world) internal {
    uint256 entity = AlloyFactoryID;
    uint32 maxLevel = 1;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    //LEVEL 1
    requiredResearch[0] = AlloyFactoryResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](2);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 800 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;

    /****************** Required Passive Resources *******************/
    ResourceValues[] memory requiredPassives = new ResourceValues[](maxLevel);
    // LEVEL 1
    uint256[] memory resourceIds = new uint256[](1);
    uint32[] memory resourceAmounts = new uint32[](1);
    resourceIds[0] = ElectricityPassiveResourceID;
    resourceAmounts[0] = 2;
    requiredPassives[0] = ResourceValues(resourceIds, resourceAmounts);

    /****************** Required Mines *******************/
    ResourceValues[] memory requiredMines = new ResourceValues[](maxLevel);
    // LEVEL 1
    resourceIds = new uint256[](2);
    resourceAmounts = new uint32[](2);
    resourceIds[0] = IronMineID;
    resourceAmounts[0] = 1;
    resourceIds[1] = CopperMineID;
    resourceAmounts[1] = 1;
    requiredMines[0] = ResourceValues(resourceIds, resourceAmounts);

    /****************** Factory Production *******************/
    ResourceValue[] memory production = new ResourceValue[](maxLevel);
    // LEVEL 1
    production[0] = ResourceValue(AlloyCraftedItemID, 1);

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
      MinesComponent(world.getComponent(MinesComponentID)).set(buildingLevelEntity, requiredMines[i]);
      RequiredPassiveComponent(world.getComponent(RequiredPassiveComponentID)).set(
        buildingLevelEntity,
        requiredPassives[i]
      );
      ProductionComponent(world.getComponent(ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  // lithium copper oxide
  function initLi2CuO2Factory(IWorld world) internal {
    uint256 entity = LithiumCopperOxideFactoryID;
    uint32 maxLevel = 1;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    // LEVEL 1
    requiredResearch[0] = LithiumCopperOxideFactoryResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](2);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 800 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;

    /****************** Required Mines *******************/
    ResourceValues[] memory requiredMines = new ResourceValues[](maxLevel);
    uint256[] memory resourceIds = new uint256[](2);
    uint32[] memory amounts = new uint32[](2);
    // LEVEL 1
    resourceIds[0] = LithiumMineID;
    amounts[0] = 1;
    resourceIds[1] = CopperMineID;
    amounts[1] = 1;
    requiredMines[0] = ResourceValues(resourceIds, amounts);

    /****************** Production *******************/
    ResourceValue[] memory production = new ResourceValue[](maxLevel);
    // LEVEL 1
    production[0] = ResourceValue(LithiumCopperOxideCraftedItemID, 1);

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
      MinesComponent(world.getComponent(MinesComponentID)).set(buildingLevelEntity, requiredMines[i]);
      ProductionComponent(world.getComponent(ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  /************************ Special Buildings ******************************** */
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
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 1
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
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 1000 });
    storageUpgrades[2] = resourceValues;

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
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

  function initSolarPanel(IWorld world) internal {
    uint256 entity = SolarPanelID;
    uint32 maxLevel = 1;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    // LEVEL 1
    requiredResearch[0] = SolarPanelResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 500 });
    requiredResources[0] = resourceValues;

    /****************** Passive Production*******************/
    ResourceValue[] memory passiveProduction = new ResourceValue[](1);
    // LEVEL 1
    passiveProduction[0] = ResourceValue({ resource: ElectricityPassiveResourceID, value: 4 });

    /* ***********************Set Values ************************* */
    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(entity, maxLevel);
    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, entity, requiredResources[i]);
      PassiveProductionComponent(world.getComponent(PassiveProductionComponentID)).set(
        buildingLevelEntity,
        passiveProduction[i]
      );
    }
  }
}
