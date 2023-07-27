// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "components/MinesComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ProductionData } from "components/ProductionComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID, PassiveProductionData } from "components/PassiveProductionComponent.sol";
import { RequiredPassiveComponent, ID as RequiredPassiveComponentID, RequiredPassiveData } from "components/RequiredPassiveComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";
import { LibSetProductionForLevel } from "../libraries/LibSetProductionForLevel.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";

import { ResourceValue, ResourceValues } from "../types.sol";
import "../prototypes.sol";

library LibBuildingDesignInitializer {
  function initIronMine(
    ItemComponent itemComponent,
    RequiredTileComponent requiredTileComponent,
    MineProductionComponent mineProductionComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //IronMineID
    requiredTileComponent.set(IronMineID, IronResourceItemID);
    maxLevelComponent.set(IronMineID, 3);
    //IronMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 1);
    mineProductionComponent.set(buildingIdLevel, 5);

    //IronMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 2);
    mineProductionComponent.set(buildingIdLevel, 7);
    requiredResearch.set(buildingIdLevel, IronMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      IronMineID,
      IronResourceItemID,
      800,
      2
    );

    //IronMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 3);
    mineProductionComponent.set(buildingIdLevel, 10);
    requiredResearch.set(buildingIdLevel, IronMine3ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      IronMineID,
      CopperResourceItemID,
      1500,
      3
    );
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 4);
    mineProductionComponent.set(buildingIdLevel, 13);
    requiredResearch.set(buildingIdLevel, IronMine4ResearchID);
    LibSetRequiredResourcesUpgrade.set2RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      IronMineID,
      CopperResourceItemID,
      2500,
      IronPlateCraftedItemID,
      500,
      3
    );
  }

  function initCopperMine(
    ItemComponent itemComponent,
    RequiredTileComponent requiredTileComponent,
    MineProductionComponent mineProductionComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //CopperMineID
    requiredTileComponent.set(CopperMineID, CopperResourceItemID);
    requiredResearch.set(CopperMineID, CopperMineResearchID);
    maxLevelComponent.set(CopperMineID, 3);

    //CopperMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 1);
    mineProductionComponent.set(buildingIdLevel, 3);
    requiredResearch.set(buildingIdLevel, CopperMineResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMineID,
      IronResourceItemID,
      500
    );

    //CopperMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 2);
    mineProductionComponent.set(buildingIdLevel, 5);
    requiredResearch.set(buildingIdLevel, CopperMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      CopperMineID,
      IronResourceItemID,
      1500,
      2
    );

    //CopperMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 3);
    mineProductionComponent.set(buildingIdLevel, 7);
    requiredResearch.set(buildingIdLevel, CopperMine3ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      CopperMineID,
      IronPlateCraftedItemID,
      1000,
      3
    );
  }

  function initLithiumMine(
    ItemComponent itemComponent,
    RequiredTileComponent requiredTileComponent,
    MineProductionComponent mineProductionComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //LithiumMineID
    requiredTileComponent.set(LithiumMineID, LithiumResourceItemID);
    requiredResearch.set(LithiumMineID, LithiumMineResearchID);
    maxLevelComponent.set(LithiumMineID, 2);
    //LithiumMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 1);
    mineProductionComponent.set(buildingIdLevel, 2);
    requiredResearch.set(buildingIdLevel, LithiumMineResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      LithiumMineID,
      IronResourceItemID,
      1500
    );

    //LithiumMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 2);
    mineProductionComponent.set(buildingIdLevel, 3);
    requiredResearch.set(buildingIdLevel, LithiumMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      LithiumMineID,
      IronPlateCraftedItemID,
      700,
      2
    );

    // //LithiumMineID Level 3
    // buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 3);
    // mineProductionComponent.set(buildingIdLevel, 5);
    // requiredResearch.set(buildingIdLevel, LithiumMine3ResearchID);
    // LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
    //   requiredResources,
    //   itemComponent,
    //   LithiumMineID,
    //   IronPlateCraftedItemID,
    //   1000,
    //   3
    // );
  }

  function initStorageUnit(
    ItemComponent itemComponent,
    MaxResourceStorageComponent maxResourceStorageComponent,
    MaxStorageComponent maxStorageComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //StorageUnitID
    maxLevelComponent.set(StorageUnitID, 3);
    requiredResearch.set(StorageUnitID, StorageUnitResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      StorageUnitID,
      IronResourceItemID,
      500
    );
    //StorageUnitID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(StorageUnitID, 1);
    //storage increase
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      1000,
      CopperResourceItemID,
      1000
    );

    //StorageUnitID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(StorageUnitID, 2);
    requiredResearch.set(buildingIdLevel, StorageUnit2ResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronPlateCraftedItemID,
      400
    );
    //storage increase
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      2000,
      CopperResourceItemID,
      2000,
      IronPlateCraftedItemID,
      1000
    );

    //StorageUnitID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(StorageUnitID, 3);
    requiredResearch.set(buildingIdLevel, StorageUnit3ResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronPlateCraftedItemID,
      1000
    );
    //storage increase
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      3000,
      CopperResourceItemID,
      3000,
      IronPlateCraftedItemID,
      2000,
      LithiumResourceItemID,
      1000
    );
  }

  function initIronPlateFactory(
    ItemComponent itemComponent,
    MinesComponent minesComponent,
    ProductionComponent productionComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //IronPlateFactoryID
    maxLevelComponent.set(IronPlateFactoryID, 2);

    requiredResearch.set(IronPlateFactoryID, IronPlateFactoryResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactoryID,
      CopperResourceItemID,
      1000
    );
    //IronPlateFactoryID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronPlateFactoryID, 1);
    //required Mines
    LibSetFactoryMineRequirements.setFactory1MineRequirement(minesComponent, IronPlateFactoryID, 1, IronMineID, 1);
    // production
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      IronPlateFactoryID,
      1,
      IronPlateCraftedItemID,
      2
    );

    //IronPlateFactoryID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(IronPlateFactoryID, 2);
    requiredResearch.set(buildingIdLevel, IronPlateFactory2ResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      CopperResourceItemID,
      3000
    );

    //required Mines
    LibSetFactoryMineRequirements.setFactory1MineRequirement(minesComponent, IronPlateFactoryID, 2, IronMineID, 1);

    // production
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      IronPlateFactoryID,
      2,
      IronPlateCraftedItemID,
      4
    );

    // //IronPlateFactoryID Level 3
    // buildingIdLevel = LibEncode.hashKeyEntity(IronPlateFactoryID, 3);
    // requiredResearch.set(buildingIdLevel, IronPlateFactory3ResearchID);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   buildingIdLevel,
    //   CopperResourceItemID,
    //   10000
    // );

    // //required Mines
    // LibSetFactoryMineRequirements.setFactory1MineRequirement(
    //   minesComponent,
    //   IronPlateFactoryID,
    //   3,
    //   IronMineID,
    //   2
    // );

    // // production
    // LibSetProductionForLevel.setProductionForLevel(
    //   productionComponent,
    //   IronPlateFactoryID,
    //   3,
    //   IronPlateCraftedItemID,
    //   9
    // );
  }

  //wip
  function initAlloyFactory(IWorld world) internal {
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(world.components(), MaxLevelComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );
    MinesComponent minesComponent = MinesComponent(getAddressById(world.components(), MinesComponentID));
    ProductionComponent productionComponent = ProductionComponent(
      getAddressById(world.components(), ProductionComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );

    //AlloyFactoryID
    //maxLevelComponent.set(AlloyFactoryID, 3);
    uint256[] memory requiredPassiveIDs = new uint256[](1);
    requiredPassiveIDs[0] = ElectricityPassiveResourceID;
    uint32[] memory requiredPassiveAmounts = new uint32[](1);
    requiredPassiveAmounts[0] = 2;

    requiredPassiveResourceComponent.set(
      AlloyFactoryID,
      ResourceValues(requiredPassiveResourceIDs, requiredPassiveResourceAmounts)
    );

    requiredResearch.set(AlloyFactoryID, AlloyFactoryResearchID);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      AlloyFactoryID,
      IronPlateCraftedItemID,
      800,
      CopperResourceItemID,
      1500
    );
    //AlloyFactoryID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(AlloyFactoryID, 1);
    //required Mines
    LibSetFactoryMineRequirements.setFactory2MineRequirement(
      minesComponent,
      AlloyFactoryID,
      1,
      IronMineID,
      1,
      CopperMineID,
      1
    );
    // production
    LibSetProductionForLevel.setProductionForLevel(productionComponent, AlloyFactoryID, 1, AlloyCraftedItemID, 1);

    // //AlloyFactoryID Level 2
    // buildingIdLevel = LibEncode.hashKeyEntity(AlloyFactoryID, 2);
    // requiredResearch.set(buildingIdLevel, AlloyFactoryResearchID);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   buildingIdLevel,
    //   IronPlateCraftedItemID,
    //   1500,
    //   CopperResourceItemID,
    //   4000
    // );
    // //AlloyFactoryID Level 2
    // //required Mines
    // LibSetFactoryMineRequirements.setFactory2MineRequirement(
    //   minesComponent,
    //   AlloyFactoryID,
    //   2,
    //   IronMineID,
    //   1,
    //   CopperMineID,
    //   1
    // );
    // // production
    // LibSetProductionForLevel.setProductionForLevel(
    //   productionComponent,
    //   AlloyFactoryID,
    //   2,
    //   AlloyCraftedItemID,
    //   2
    // );

    // //AlloyFactoryID Level 3
    // buildingIdLevel = LibEncode.hashKeyEntity(AlloyFactoryID, 3);
    // requiredResearch.set(buildingIdLevel, AlloyFactory3ResearchID);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   buildingIdLevel,
    //   IronPlateCraftedItemID,
    //   10000
    // );

    // //required Mines
    // LibSetFactoryMineRequirements.setFactory2MineRequirement(
    //   minesComponent,
    //   AlloyFactoryID,
    //   3,
    //   IronMineID,
    //   2,
    //   CopperMineID,
    //   2
    // );

    // // production
    // LibSetProductionForLevel.setProductionForLevel(
    //   productionComponent,
    //   AlloyFactoryID,
    //   3,
    //   AlloyCraftedItemID,
    //   5
    // );
  }

  function initLithiumCopperOxideFactory(IWorld world) internal {
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(world.components(), MaxLevelComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );
    MinesComponent minesComponent = MinesComponent(getAddressById(world.components(), MinesComponentID));
    ProductionComponent productionComponent = ProductionComponent(
      getAddressById(world.components(), ProductionComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));

    //LithiumCopperOxideFactoryID
    maxLevelComponent.set(LithiumCopperOxideFactoryID, 1);

    requiredResearch.set(LithiumCopperOxideFactoryID, LithiumCopperOxideFactoryResearchID);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumCopperOxideFactoryID,
      IronPlateCraftedItemID,
      800,
      CopperResourceItemID,
      1500
    );
    //required Mines
    LibSetFactoryMineRequirements.setFactory2MineRequirement(
      minesComponent,
      LithiumCopperOxideFactoryID,
      1,
      LithiumMineID,
      1,
      CopperMineID,
      1
    );
    // production
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      LithiumCopperOxideFactoryID,
      1,
      LithiumCopperOxideCraftedItemID,
      1
    );

    // //LithiumCopperOxideFactoryID Level 2
    // buildingIdLevel = LibEncode.hashKeyEntity(LithiumCopperOxideFactoryID, 2);
    // requiredResearch.set(buildingIdLevel, LithiumCopperOxideFactoryResearchID);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   buildingIdLevel,
    //   AlloyCraftedItemID,
    //   1500,
    //   IronPlateCraftedItemID,
    //   4000
    // );
    // //LithiumCopperOxideFactoryID Level 2
    // //required Mines
    // LibSetFactoryMineRequirements.setFactory2MineRequirement(
    //   minesComponent,
    //   LithiumCopperOxideFactoryID,
    //   2,
    //   LithiumMineID,
    //   1,
    //   CopperMineID,
    //   1
    // );
    // // production
    // LibSetProductionForLevel.setProductionForLevel(
    //   productionComponent,
    //   LithiumCopperOxideFactoryID,
    //   2,
    //   LithiumCopperOxideCraftedItemID,
    //   3
    // );

    // //LithiumCopperOxideFactoryID Level 3
    // buildingIdLevel = LibEncode.hashKeyEntity(LithiumCopperOxideFactoryID, 3);
    // requiredResearch.set(buildingIdLevel, LithiumCopperOxideFactory3ResearchID);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   buildingIdLevel,
    //   AlloyCraftedItemID,
    //   5000,
    //   IronResourceItemID,
    //   20000
    // );

    // //required Mines
    // LibSetFactoryMineRequirements.setFactory2MineRequirement(
    //   minesComponent,
    //   LithiumCopperOxideFactoryID,
    //   3,
    //   LithiumMineID,
    //   2,
    //   CopperMineID,
    //   2
    // );

    // // production
    // LibSetProductionForLevel.setProductionForLevel(
    //   productionComponent,
    //   LithiumCopperOxideFactoryID,
    //   3,
    //   LithiumCopperOxideCraftedItemID,
    //   7
    // );
  }

  function initSolarPanel(IWorld world) internal {
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(world.components(), PassiveProductionComponentID)
    );
    //SolarPanelID

    requiredResearch.set(SolarPanelID, SolarPanelResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      SolarPanelID,
      LithiumCopperOxideCraftedItemID,
      500
    );
    passiveProductionComponent.set(SolarPanelID, PassiveProductionData(ElectricityPassiveResourceID, 4));
  }

  function initHousingUnit(IWorld world) internal {
    // RequiredResearchComponent requiredResearch = RequiredResearchComponent(
    //   getAddressById(world.components(), RequiredResearchComponentID)
    // );
    // RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
    //   getAddressById(world.components(), RequiredResourcesComponentID)
    // );
    // ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    // PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
    //   getAddressById(world.components(), PassiveProductionComponentID)
    // );
    // //HousingUnitID
    // requiredResearch.set(HousingUnitID, HousingUnitResearchID);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   HousingUnitID,
    //   IronPlateCraftedItemID,
    //   1000
    // );
    // passiveProductionComponent.set(HousingUnitID, PassiveProductionData(HousingPassiveResourceID, 20));
  }

  function initMainBase(
    ItemComponent itemComponent,
    MaxResourceStorageComponent maxResourceStorageComponent,
    MaxStorageComponent maxStorageComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResourcesComponent requiredResources
  ) internal {
    //MainBaseID
    maxLevelComponent.set(MainBaseID, 6);

    //MainBaseID
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 1);
    //MainBase ID Level 1
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      1000
    );

    //MainBaseID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 2);
    //upgrade cost
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronResourceItemID,
      500
    );
    //storage increase
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      1500,
      CopperResourceItemID,
      1500
    );

    //MainBaseID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 3);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronResourceItemID,
      800,
      CopperResourceItemID,
      800
    );
    //storage increase
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      2500,
      CopperResourceItemID,
      2500,
      IronPlateCraftedItemID,
      1000
    );

    //MainBaseID Level 4
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 4);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronPlateCraftedItemID,
      800
    );
    //storage increase
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      4000,
      CopperResourceItemID,
      4000,
      IronPlateCraftedItemID,
      2500,
      LithiumResourceItemID,
      1500
    );

    //MainBaseID Level 5
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      IronPlateCraftedItemID,
      800,
      LithiumResourceItemID,
      800
    );
    //storage increase
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      LithiumCopperOxideCraftedItemID,
      2000,
      AlloyCraftedItemID,
      2000,
      IronPlateCraftedItemID,
      4000,
      LithiumResourceItemID,
      4000
    );

    //MainBaseID Level 6
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 6);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      AlloyCraftedItemID,
      1000
    );
    //storage increase
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      LithiumCopperOxideCraftedItemID,
      2000,
      AlloyCraftedItemID,
      2000,
      IronPlateCraftedItemID,
      4000,
      LithiumResourceItemID,
      4000
    );
  }

  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );

    RequiredTileComponent requiredTileComponent = RequiredTileComponent(
      getAddressById(components, RequiredTileComponentID)
    );
    MineProductionComponent mineProductionComponent = MineProductionComponent(
      getAddressById(components, MineProductionComponentID)
    );
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getAddressById(components, MaxResourceStorageComponentID)
    );
    ProductionComponent productionComponent = ProductionComponent(getAddressById(components, ProductionComponentID));
    MinesComponent minesComponent = MinesComponent(getAddressById(components, MinesComponentID));

    initMainBase(itemComponent, maxResourceStorageComponent, maxStorageComponent, maxLevelComponent, requiredResources);

    //Iron Mine
    initIronMine(
      itemComponent,
      requiredTileComponent,
      mineProductionComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );
    initCopperMine(
      itemComponent,
      requiredTileComponent,
      mineProductionComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );
    initLithiumMine(
      itemComponent,
      requiredTileComponent,
      mineProductionComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    initStorageUnit(
      itemComponent,
      maxResourceStorageComponent,
      maxStorageComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    initIronPlateFactory(
      itemComponent,
      minesComponent,
      productionComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    initAlloyFactory(world);
    initLithiumCopperOxideFactory(world);

    initSolarPanel(world);

    initHousingUnit(world);
  }
}
