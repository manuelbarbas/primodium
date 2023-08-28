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
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
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
    uint32 maxLevel = 8;

    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(entity);
    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);

    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](0);
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 12000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 6000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 12000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 8000 });
    requiredResources[2] = resourceValues;
    //LEVEL 4
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 35000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 10000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 80000 });
    requiredResources[4] = resourceValues;
    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 250000 });
    requiredResources[5] = resourceValues;

    //LEVEL 7
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IridiumResourceItemID, value: 420000 });
    requiredResources[6] = resourceValues;

    //LEVEL 8
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 590000 });
    requiredResources[7] = resourceValues;

    /****************** Storage Upgrades *******************/
    ResourceValue[][] memory storageUpgrades = new ResourceValue[][](maxLevel);
    // LEVEL 1
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 275000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 135000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 54000 });
    storageUpgrades[0] = resourceValues;

    // LEVEL 2
    resourceValues = new ResourceValue[](5);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 540000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 270000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 108000 });
    resourceValues[3] = ResourceValue({ resource: IronPlateCraftedItemID, value: 43200 });
    resourceValues[4] = ResourceValue({ resource: AlloyCraftedItemID, value: 27000 });
    storageUpgrades[1] = resourceValues;

    // LEVEL 3
    resourceValues = new ResourceValue[](7);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1440000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 720000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 288000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 144000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 115200 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 72000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 43200 });
    storageUpgrades[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](11);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 3600000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 1800000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 720000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 360000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 288000 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 180000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 108000 });
    resourceValues[7] = ResourceValue({ resource: TitaniumResourceItemID, value: 100000 });
    resourceValues[8] = ResourceValue({ resource: PlatinumResourceItemID, value: 40000 });
    resourceValues[9] = ResourceValue({ resource: IridiumResourceItemID, value: 25000 });
    resourceValues[10] = ResourceValue({ resource: KimberliteResourceItemID, value: 10000 });
    storageUpgrades[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](11);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 5760000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 2880000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 1152000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 576000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 460800 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 300000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 300000 });
    resourceValues[7] = ResourceValue({ resource: TitaniumResourceItemID, value: 300000 });
    resourceValues[8] = ResourceValue({ resource: PlatinumResourceItemID, value: 300000 });
    resourceValues[9] = ResourceValue({ resource: IridiumResourceItemID, value: 200000 });
    resourceValues[10] = ResourceValue({ resource: KimberliteResourceItemID, value: 100000 });
    storageUpgrades[4] = resourceValues;
    // LEVEL 6
    resourceValues = new ResourceValue[](11);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 8640000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 4320000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 1728000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 864000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 691200 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 600000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 600000 });
    resourceValues[7] = ResourceValue({ resource: TitaniumResourceItemID, value: 600000 });
    resourceValues[8] = ResourceValue({ resource: PlatinumResourceItemID, value: 600000 });
    resourceValues[9] = ResourceValue({ resource: IridiumResourceItemID, value: 600000 });
    resourceValues[10] = ResourceValue({ resource: KimberliteResourceItemID, value: 250000 });
    storageUpgrades[5] = resourceValues;

    // LEVEL 7
    resourceValues = new ResourceValue[](11);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 17280000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 8640000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 3456000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 1728000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 138200 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 864000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 700000 });
    resourceValues[7] = ResourceValue({ resource: TitaniumResourceItemID, value: 700000 });
    resourceValues[8] = ResourceValue({ resource: PlatinumResourceItemID, value: 700000 });
    resourceValues[9] = ResourceValue({ resource: IridiumResourceItemID, value: 700000 });
    resourceValues[10] = ResourceValue({ resource: KimberliteResourceItemID, value: 700000 });
    storageUpgrades[6] = resourceValues;

    //LEVEL 8
    resourceValues = new ResourceValue[](11);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 34560000 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 17280000 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 6912000 });
    resourceValues[3] = ResourceValue({ resource: SulfurResourceItemID, value: 3456000 });
    resourceValues[4] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2764000 });
    resourceValues[5] = ResourceValue({ resource: AlloyCraftedItemID, value: 1728000 });
    resourceValues[6] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1036800 });
    resourceValues[7] = ResourceValue({ resource: TitaniumResourceItemID, value: 800000 });
    resourceValues[8] = ResourceValue({ resource: PlatinumResourceItemID, value: 800000 });
    resourceValues[9] = ResourceValue({ resource: IridiumResourceItemID, value: 800000 });
    resourceValues[10] = ResourceValue({ resource: KimberliteResourceItemID, value: 800000 });
    storageUpgrades[7] = resourceValues;

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

  function setupMine(
    IWorld world,
    uint256 mineBuildingType,
    uint32 maxLevel,
    uint32[] memory requiredMainBaseLevels,
    ResourceValue[][] memory requiredResources,
    uint256 productionResourceType,
    uint32[] memory productionRates
  ) internal {
    P_IsBuildingTypeComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(mineBuildingType);
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(mineBuildingType, maxLevel);
    P_RequiredTileComponent(world.getComponent(P_RequiredTileComponentID)).set(
      mineBuildingType,
      productionResourceType
    );
    P_BlueprintComponent(world.getComponent(P_BlueprintComponentID)).set(
      mineBuildingType,
      LibBlueprint.get1x1Blueprint()
    );

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(mineBuildingType, level);
      P_ProductionComponent(world.getComponent(P_ProductionComponentID)).set(
        buildingLevelEntity,
        ResourceValue({ resource: IronResourceItemID, value: productionRates[i] })
      );
      LevelComponent(world.getComponent(LevelComponentID)).set(buildingLevelEntity, requiredMainBaseLevels[i]);
      LibSetBuildingReqs.setResourceReqs(world, buildingLevelEntity, requiredResources[i]);
    }
  }

  /******************************** Mines ********************************** */

  function initIronMine(IWorld world) internal {
    uint256 mineBuildingType = IronMineID;
    uint32 maxLevel = 3;
    uint256 productionResourceType = IronResourceItemID;

    /****************** Required Main Base Levels *******************/
    uint32[] memory requiredMainBaseLevels = new uint32[](maxLevel);
    requiredMainBaseLevels[0] = 1;
    requiredMainBaseLevels[1] = 5;
    requiredMainBaseLevels[2] = 7;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);
    productionRates[0] = 50;
    productionRates[1] = 60;
    productionRates[2] = 75;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](0);
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 20000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    setupMine(
      world,
      mineBuildingType,
      maxLevel,
      requiredMainBaseLevels,
      requiredResources,
      productionResourceType,
      productionRates
    );
  }

  function initCopperMine(IWorld world) internal {
    uint256 mineBuildingType = CopperMineID;
    uint256 productionResourceType = CopperResourceItemID;
    uint32 maxLevel = 3;

    /****************** Required Main Base Levels *******************/
    uint32[] memory requiredMainBaseLevels = new uint32[](maxLevel);
    requiredMainBaseLevels[0] = 1;
    requiredMainBaseLevels[1] = 5;
    requiredMainBaseLevels[2] = 7;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);

    productionRates[0] = 30;
    productionRates[1] = 40;
    productionRates[2] = 50;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 50000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 250000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    setupMine(
      world,
      mineBuildingType,
      maxLevel,
      requiredMainBaseLevels,
      requiredResources,
      productionResourceType,
      productionRates
    );
  }

  function initLithiumMine(IWorld world) internal {
    uint256 mineBuildingType = LithiumMineID;
    uint256 productionResourceType = LithiumResourceItemID;
    uint32 maxLevel = 3;

    /****************** Required Main Base Levels *******************/
    uint32[] memory requiredMainBaseLevels = new uint32[](maxLevel);
    requiredMainBaseLevels[0] = 1;
    requiredMainBaseLevels[1] = 5;
    requiredMainBaseLevels[2] = 7;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);
    productionRates[0] = 20;
    productionRates[1] = 25;
    productionRates[1] = 30;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues;
    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 5000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100000 });
    requiredResources[1] = resourceValues;

    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 500000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    setupMine(
      world,
      mineBuildingType,
      maxLevel,
      requiredMainBaseLevels,
      requiredResources,
      productionResourceType,
      productionRates
    );
  }

  function initSulfurMine(IWorld world) internal {
    uint256 mineBuildingType = SulfurMineID;
    uint256 productionResourceType = SulfurResourceItemID;
    uint32 maxLevel = 3;

    /****************** Required Main Base Levels *******************/
    uint32[] memory requiredMainBaseLevels = new uint32[](maxLevel);
    requiredMainBaseLevels[0] = 1;
    requiredMainBaseLevels[1] = 5;
    requiredMainBaseLevels[2] = 7;

    /****************** Production Rates *******************/
    uint32[] memory productionRates = new uint32[](maxLevel);
    productionRates[0] = 10;
    productionRates[1] = 12;
    productionRates[1] = 15;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    ResourceValue[] memory resourceValues;
    // LEVEL 1
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 50000 });
    requiredResources[1] = resourceValues;

    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 100000 });
    requiredResources[2] = resourceValues;

    /* ***********************Set Values ************************* */
    setupMine(
      world,
      mineBuildingType,
      maxLevel,
      requiredMainBaseLevels,
      requiredResources,
      productionResourceType,
      productionRates
    );
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
    uint256 entity = PhotovoltaicCellFactoryID;
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
    production[0] = ResourceValue(PhotovoltaicCellCraftedItemID, 1);

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
    resourceValues[0] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 500 });
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
