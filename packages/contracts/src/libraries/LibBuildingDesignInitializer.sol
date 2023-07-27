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
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, ResourceValue } from "components/FactoryProductionComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, PassiveResourceProductionData } from "components/PassiveResourceProductionComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID } from "components/RequiredPassiveResourceComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";
import { LibSetFactoryProductionForLevel } from "../libraries/LibSetFactoryProductionForLevel.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";

import { ResourceValue, ResourceValues } from "../types.sol";
import "../prototypes.sol";

library LibBuildingDesignInitializer {
  function initIronMine(
    ItemComponent itemComponent,
    RequiredTileComponent requiredTileComponent,
    MineComponent mineComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources
  ) internal {
    //IronMineID
    requiredTileComponent.set(IronMineID, IronResourceItemID);
    maxLevelComponent.set(IronMineID, 3);
    //IronMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 1);
    mineComponent.set(buildingIdLevel, 5);

    //IronMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 2);
    mineComponent.set(buildingIdLevel, 7);
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
    mineComponent.set(buildingIdLevel, 10);
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
    mineComponent.set(buildingIdLevel, 13);
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
    MineComponent mineComponent,
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
    mineComponent.set(buildingIdLevel, 3);
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
    mineComponent.set(buildingIdLevel, 5);
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
    mineComponent.set(buildingIdLevel, 7);
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
    MineComponent mineComponent,
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
    mineComponent.set(buildingIdLevel, 2);
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
    mineComponent.set(buildingIdLevel, 3);
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
    // mineComponent.set(buildingIdLevel, 5);
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
    OwnedResourcesComponent ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    FactoryProductionComponent factoryProductionComponent,
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
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      IronPlateFactoryID,
      1,
      IronMineID,
      1
    );
    // production
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
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
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      IronPlateFactoryID,
      2,
      IronMineID,
      1
    );

    // production
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
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
    //   factoryMineBuildingsComponent,
    //   IronPlateFactoryID,
    //   3,
    //   IronMineID,
    //   2
    // );

    // // production
    // LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
    //   factoryProductionComponent,
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
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(world.components(), FactoryMineBuildingsComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(world.components(), FactoryProductionComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(world.components(), RequiredPassiveResourceComponentID)
    );

    //AlloyFactoryID
    //maxLevelComponent.set(AlloyFactoryID, 3);
    uint256[] memory requiredPassiveResourceIDs = new uint256[](1);
    requiredPassiveResourceIDs[0] = ElectricityPassiveResourceID;
    uint32[] memory requiredPassiveResourceAmounts = new uint32[](1);
    requiredPassiveResourceAmounts[0] = 2;

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
      factoryMineBuildingsComponent,
      AlloyFactoryID,
      1,
      IronMineID,
      1,
      CopperMineID,
      1
    );
    // production
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      AlloyFactoryID,
      1,
      AlloyCraftedItemID,
      1
    );

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
    //   factoryMineBuildingsComponent,
    //   AlloyFactoryID,
    //   2,
    //   IronMineID,
    //   1,
    //   CopperMineID,
    //   1
    // );
    // // production
    // LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
    //   factoryProductionComponent,
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
    //   factoryMineBuildingsComponent,
    //   AlloyFactoryID,
    //   3,
    //   IronMineID,
    //   2,
    //   CopperMineID,
    //   2
    // );

    // // production
    // LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
    //   factoryProductionComponent,
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
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(world.components(), FactoryMineBuildingsComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(world.components(), FactoryProductionComponentID)
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
      factoryMineBuildingsComponent,
      LithiumCopperOxideFactoryID,
      1,
      LithiumMineID,
      1,
      CopperMineID,
      1
    );
    // production
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
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
    //   factoryMineBuildingsComponent,
    //   LithiumCopperOxideFactoryID,
    //   2,
    //   LithiumMineID,
    //   1,
    //   CopperMineID,
    //   1
    // );
    // // production
    // LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
    //   factoryProductionComponent,
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
    //   factoryMineBuildingsComponent,
    //   LithiumCopperOxideFactoryID,
    //   3,
    //   LithiumMineID,
    //   2,
    //   CopperMineID,
    //   2
    // );

    // // production
    // LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
    //   factoryProductionComponent,
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
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(world.components(), PassiveResourceProductionComponentID)
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
    passiveResourceProductionComponent.set(
      SolarPanelID,
      PassiveResourceProductionData(ElectricityPassiveResourceID, 4)
    );
  }

  function initHousingUnit(IWorld world) internal {
    // RequiredResearchComponent requiredResearch = RequiredResearchComponent(
    //   getAddressById(world.components(), RequiredResearchComponentID)
    // );
    // RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
    //   getAddressById(world.components(), RequiredResourcesComponentID)
    // );
    // ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    // PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
    //   getAddressById(world.components(), PassiveResourceProductionComponentID)
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
    // passiveResourceProductionComponent.set(HousingUnitID, PassiveResourceProductionData(HousingPassiveResourceID, 20));
  }

  function initMainBase(
    ItemComponent itemComponent,
    OwnedResourcesComponent ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
      ownedResourcesComponent,
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
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    OwnedResourcesComponent ownedResourcesComponent = OwnedResourcesComponent(
      getAddressById(components, OwnedResourcesComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );

    initMainBase(itemComponent, ownedResourcesComponent, maxStorageComponent, maxLevelComponent, requiredResources);

    //Iron Mine
    initIronMine(
      itemComponent,
      requiredTileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );
    initCopperMine(
      itemComponent,
      requiredTileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );
    initLithiumMine(
      itemComponent,
      requiredTileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    initStorageUnit(
      itemComponent,
      ownedResourcesComponent,
      maxStorageComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    initIronPlateFactory(
      itemComponent,
      factoryMineBuildingsComponent,
      factoryProductionComponent,
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
