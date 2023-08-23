// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
// Production Buildings
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";

import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID, ResourceValue } from "components/P_UtilityProductionComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_MaxMovesComponent, ID as P_MaxMovesComponentID } from "components/P_MaxMovesComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
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
    initStarmapper(world);
  }

  function initMainBase(IWorld world) internal {
    uint256 entity = MainBaseID;
    uint32 maxLevel = 6;

    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 4000 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 4000 });
    storageUpgrades[4] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: IronPlateCraftedItemID, value: 4000 });
    resourceValues[3] = ResourceValue({ resource: LithiumResourceItemID, value: 4000 });
    storageUpgrades[5] = resourceValues;
    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get3x3Blueprint());

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
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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

    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_RequiredTileComponent(world.getComponent(P_RequiredTileComponentID)).set(entity, IronResourceItemID);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(
        buildingLevelEntity,
        ResourceValue({ resource: IronResourceItemID, value: productionRates[i] })
      );

      if (requiredResearch[i] > 0)
        P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
          buildingLevelEntity,
          requiredResearch[i]
        );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
    }
  }

  function initCopperMine(IWorld world) internal {
    uint256 entity = CopperMineID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_RequiredTileComponent(world.getComponent(P_RequiredTileComponentID)).set(entity, CopperResourceItemID);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(
        buildingLevelEntity,
        ResourceValue({ resource: CopperResourceItemID, value: productionRates[i] })
      );
      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
    }
  }

  function initLithiumMine(IWorld world) internal {
    uint256 entity = LithiumMineID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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
    ResourceValue[] memory resourceValues;
    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 700 });
    requiredResources[1] = resourceValues;

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_RequiredTileComponent(world.getComponent(P_RequiredTileComponentID)).set(entity, LithiumResourceItemID);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get1x1Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(
        buildingLevelEntity,
        ResourceValue({ resource: LithiumResourceItemID, value: productionRates[i] })
      );
      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
    }
  }

  /****************************** Factories ******************************** */

  function initIronPlateFactory(IWorld world) internal {
    uint256 entity = IronPlateFactoryID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
    uint32 maxLevel = 2;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    requiredResearch[0] = IronPlateFactoryResearchID;
    requiredResearch[1] = IronPlateFactory2ResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues;

    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    requiredResources[1] = resourceValues;

    /****************** Required Mines *******************/
    ResourceValues[] memory requiredConnectedProductions = new ResourceValues[](maxLevel);
    // LEVEL 1
    uint256[] memory mineIds;
    uint32[] memory mineCounts;

    mineIds = new uint256[](1);
    mineCounts = new uint32[](1);
    mineIds[0] = IronResourceItemID;
    mineCounts[0] = 1;
    requiredConnectedProductions[0] = ResourceValues(mineIds, mineCounts);
    // LEVEL 2
    mineIds = new uint256[](1);
    mineCounts = new uint32[](1);
    mineIds[0] = IronResourceItemID;
    mineCounts[0] = 1;
    requiredConnectedProductions[1] = ResourceValues(mineIds, mineCounts);

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
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get2x2Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      P_ProductionDependenciesComponent(world.getComponent(P_ProductionDependenciesComponentID)).set(
        buildingLevelEntity,
        requiredConnectedProductions[i]
      );
      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  function initAlloyFactory(IWorld world) internal {
    uint256 entity = AlloyFactoryID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
    uint32 maxLevel = 1;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    //LEVEL 1
    requiredResearch[0] = AlloyFactoryResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues;
    // LEVEL 1
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 800 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;

    /****************** Required Utility Resources *******************/
    ResourceValues[] memory requiredUtilitys = new ResourceValues[](maxLevel);
    // LEVEL 1
    uint256[] memory resourceIds;
    uint32[] memory resourceAmounts;

    resourceIds = new uint256[](1);
    resourceAmounts = new uint32[](1);
    resourceIds[0] = ElectricityUtilityResourceID;
    resourceAmounts[0] = 2;
    requiredUtilitys[0] = ResourceValues(resourceIds, resourceAmounts);

    /****************** Required Mines *******************/
    ResourceValues[] memory requiredConnectedProductions = new ResourceValues[](maxLevel);
    // LEVEL 1
    resourceIds = new uint256[](2);
    resourceAmounts = new uint32[](2);
    resourceIds[0] = IronResourceItemID;
    resourceAmounts[0] = 1;
    resourceIds[1] = CopperResourceItemID;
    resourceAmounts[1] = 1;
    requiredConnectedProductions[0] = ResourceValues(resourceIds, resourceAmounts);

    /****************** Factory Production *******************/
    ResourceValue[] memory production = new ResourceValue[](maxLevel);
    // LEVEL 1
    production[0] = ResourceValue(AlloyCraftedItemID, 1);

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get2x2Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      P_ProductionDependenciesComponent(world.getComponent(P_ProductionDependenciesComponentID)).set(
        buildingLevelEntity,
        requiredConnectedProductions[i]
      );
      P_RequiredUtilityComponent(world.getComponent(P_RequiredUtilityComponentID)).set(
        buildingLevelEntity,
        requiredUtilitys[i]
      );
      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  // lithium copper oxide
  function initLi2CuO2Factory(IWorld world) internal {
    uint256 entity = LithiumCopperOxideFactoryID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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
    ResourceValues[] memory requiredConnectedProductions = new ResourceValues[](maxLevel);
    uint256[] memory resourceIds = new uint256[](2);
    uint32[] memory amounts = new uint32[](2);
    // LEVEL 1
    resourceIds[0] = LithiumResourceItemID;
    amounts[0] = 1;
    resourceIds[1] = CopperResourceItemID;
    amounts[1] = 1;
    requiredConnectedProductions[0] = ResourceValues(resourceIds, amounts);

    /****************** Production *******************/
    ResourceValue[] memory production = new ResourceValue[](maxLevel);
    // LEVEL 1
    production[0] = ResourceValue(LithiumCopperOxideCraftedItemID, 1);

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get2x2Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      P_ProductionDependenciesComponent(world.getComponent(P_ProductionDependenciesComponentID)).set(
        buildingLevelEntity,
        requiredConnectedProductions[i]
      );
      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(buildingLevelEntity, production[i]);
    }
  }

  /************************ Special Buildings ******************************** */
  function initStorageUnit(IWorld world) internal {
    uint256 entity = StorageUnitID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
    uint32 maxLevel = 3;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);

    requiredResearch[0] = StorageUnitResearchID;
    requiredResearch[1] = StorageUnit2ResearchID;
    requiredResearch[2] = StorageUnit3ResearchID;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues;
    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 400 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
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
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get2x2Blueprint());
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      LibSetBuildingReqs.setStorageUpgrades(world, buildingLevelEntity, storageUpgrades[i]);
    }
  }

  function initSolarPanel(IWorld world) internal {
    uint256 entity = SolarPanelID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
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

    /****************** Utility Production*******************/
    ResourceValue[] memory UtilityProduction = new ResourceValue[](1);
    // LEVEL 1
    UtilityProduction[0] = ResourceValue({ resource: ElectricityUtilityResourceID, value: 4 });

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get2x2Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
      P_UtilityProductionComponent(world.getComponent(P_UtilityProductionComponentID)).set(
        buildingLevelEntity,
        UtilityProduction[i]
      );
    }
  }

  function initStarmapper(IWorld world) internal {
    uint256 entity = StarmapperID;
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
    uint32 maxLevel = 3;

    /****************** Required Research *******************/
    uint256[] memory requiredResearch = new uint256[](maxLevel);
    // LEVEL 1
    requiredResearch[0] = StarmapperResearchID;
    // LEVEL 2
    requiredResearch[1] = Starmapper2ResearchID;
    // LEVEL 3
    requiredResearch[2] = Starmapper3ResearchID;
    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // LEVEL 1
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1 });
    requiredResources[0] = resourceValues;

    // LEVEL 2
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1 });
    requiredResources[1] = resourceValues;

    // LEVEL 3
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1 });
    requiredResources[2] = resourceValues;

    /* -------------------------------- Max Moves ------------------------------- */
    // note: each value here must be geq its predecessor (obviously).
    uint32[] memory maxMoves = new uint32[](maxLevel);
    // LEVEL 1
    maxMoves[0] = 1;
    // LEVEL 2
    maxMoves[1] = 2;
    // LEVEL 3
    maxMoves[2] = 3;

    /* ***********************Set Values ************************* */
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(entity, maxLevel);
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(entity, LibBlueprint.get3x3Blueprint());

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);

      P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).set(buildingLevelEntity, maxMoves[i]);
      P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
        buildingLevelEntity,
        requiredResearch[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
    }
  }
}
