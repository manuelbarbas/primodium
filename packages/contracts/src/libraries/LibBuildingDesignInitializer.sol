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
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";

import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";
import { LibSetFactoryProductionForLevel } from "../libraries/LibSetFactoryProductionForLevel.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";
// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";
import { IronMine2ResearchID, IronMine3ResearchID, IronMine4ResearchID } from "../prototypes/Keys.sol";
import { CopperMineResearchID, CopperMine2ResearchID, CopperMine3ResearchID } from "../prototypes/Keys.sol";
import { LithiumMineResearchID, LithiumMine2ResearchID, LithiumMine3ResearchID } from "../prototypes/Keys.sol";
import { StorageUnitResearchID, StorageUnit2ResearchID, StorageUnit3ResearchID } from "../prototypes/Keys.sol";
import { IronPlateFactoryResearchID, IronPlateFactory2ResearchID, IronPlateFactory3ResearchID } from "../prototypes/Keys.sol";
import { IronMineID, CopperMineID, LithiumMineID } from "../prototypes/Tiles.sol";
import { IronPlateFactoryID } from "../prototypes/Tiles.sol";
import { StorageUnitID } from "../prototypes/Tiles.sol";

library LibBuildingDesignInitializer {
  function initIronMine(
    ItemComponent itemComponent,
    TileComponent tileComponent,
    MineComponent mineComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources,
    uint256[] memory requiredResourceIds
  ) internal {
    //IronMineID
    tileComponent.set(IronMineID, IronResourceItemID);
    maxLevelComponent.set(IronMineID, 3);
    //IronMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 1);
    mineComponent.set(buildingIdLevel, 1);

    //IronMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    requiredResearch.set(buildingIdLevel, IronMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      IronMineID,
      CopperResourceItemID,
      300,
      2
    );

    //IronMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 3);
    mineComponent.set(buildingIdLevel, 3);
    requiredResearch.set(buildingIdLevel, IronMine3ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      IronMineID,
      CopperResourceItemID,
      1000,
      3
    );
  }

  function initCopperMine(
    ItemComponent itemComponent,
    TileComponent tileComponent,
    MineComponent mineComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources,
    uint256[] memory requiredResourceIds
  ) internal {
    //CopperMineID
    tileComponent.set(CopperMineID, CopperResourceItemID);
    maxLevelComponent.set(CopperMineID, 3);
    //CopperMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
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
    mineComponent.set(buildingIdLevel, 2);
    requiredResearch.set(buildingIdLevel, CopperMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      CopperMineID,
      IronPlateCraftedItemID,
      300,
      2
    );

    //CopperMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 3);
    mineComponent.set(buildingIdLevel, 3);
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
    TileComponent tileComponent,
    MineComponent mineComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources,
    uint256[] memory requiredResourceIds
  ) internal {
    //LithiumMineID
    tileComponent.set(LithiumMineID, CopperResourceItemID);
    maxLevelComponent.set(LithiumMineID, 3);
    //LithiumMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
    requiredResearch.set(buildingIdLevel, LithiumMineResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      LithiumMineID,
      IronResourceItemID,
      500
    );

    //LithiumMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    requiredResearch.set(buildingIdLevel, LithiumMine2ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      LithiumMineID,
      IronPlateCraftedItemID,
      300,
      2
    );

    //LithiumMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(LithiumMineID, 3);
    mineComponent.set(buildingIdLevel, 3);
    requiredResearch.set(buildingIdLevel, LithiumMine3ResearchID);
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResources,
      itemComponent,
      LithiumMineID,
      IronPlateCraftedItemID,
      1000,
      3
    );
  }

  function initStorageUnit(
    ItemComponent itemComponent,
    StorageCapacityResourcesComponent storageCapacityResourcesComponent,
    StorageCapacityComponent storageCapacityComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResources,
    uint256[] memory requiredResourceIds
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      2000,
      CopperResourceItemID,
      2000,
      IronPlateCraftedItemID,
      1000,
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
    maxLevelComponent.set(IronPlateFactoryID, 3);

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
      1
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
      2
    );

    //IronPlateFactoryID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(IronPlateFactoryID, 3);
    requiredResearch.set(buildingIdLevel, IronPlateFactory3ResearchID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      buildingIdLevel,
      CopperResourceItemID,
      10000
    );

    //required Mines
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      IronPlateFactoryID,
      3,
      IronMineID,
      2
    );

    // production
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      IronPlateFactoryID,
      3,
      IronPlateCraftedItemID,
      3
    );
  }

  function initMainBase(
    ItemComponent itemComponent,
    StorageCapacityResourcesComponent storageCapacityResourcesComponent,
    StorageCapacityComponent storageCapacityComponent,
    MaxLevelComponent maxLevelComponent,
    RequiredResourcesComponent requiredResources,
    uint256[] memory requiredResourceIds
  ) internal {
    //MainBaseID
    maxLevelComponent.set(MainBaseID, 5);

    //MainBaseID
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 1);
    //MainBase ID Level 1
    LibSetRequiredResources.set1RequiredResourceForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      600
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      1000,
      CopperResourceItemID,
      1000
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      2000,
      CopperResourceItemID,
      2000,
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
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      3000,
      CopperResourceItemID,
      3000,
      IronPlateCraftedItemID,
      1500,
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

    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );

    uint256[] memory reUsabelArray;

    initMainBase(
      itemComponent,
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      maxLevelComponent,
      requiredResources,
      reUsabelArray
    );

    //Iron Mine
    initIronMine(
      itemComponent,
      tileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources,
      reUsabelArray
    );
    initCopperMine(
      itemComponent,
      tileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources,
      reUsabelArray
    );
    initLithiumMine(
      itemComponent,
      tileComponent,
      mineComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources,
      reUsabelArray
    );

    initStorageUnit(
      itemComponent,
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources,
      reUsabelArray
    );

    initIronPlateFactory(
      itemComponent,
      factoryMineBuildingsComponent,
      factoryProductionComponent,
      maxLevelComponent,
      requiredResearch,
      requiredResources
    );

    //old stuff

    //BasicMinerId
    // Build BasicMiner with 100 IronResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      BasicMinerID,
      IronResourceItemID,
      100
    );

    //Node
    // Build Node with 50 IronResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      NodeID,
      IronResourceItemID,
      50
    );

    //PlatingFactoryID
    // Build PlatingFactory with 100 IronResource and 50 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PlatingFactoryID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      50
    );

    requiredResearch.set(PlatingFactoryID, PlatingFactoryResearchID);

    //BasicBatteryFactoryID
    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      BasicBatteryFactoryID,
      IronPlateCraftedItemID,
      20,
      CopperResourceItemID,
      50
    );

    requiredResearch.set(BasicBatteryFactoryID, BasicBatteryFactoryResearchID);

    //KineticMissileFactoryID
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KineticMissileFactoryID,
      IronPlateCraftedItemID,
      100,
      LithiumResourceItemID,
      50,
      BasicPowerSourceCraftedItemID,
      10
    );

    requiredResearch.set(KineticMissileFactoryID, KineticMissileFactoryResearchID);

    //ProjectileLauncherID
    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ProjectileLauncherID,
      IronPlateCraftedItemID,
      100,
      TitaniumResourceItemID,
      100
    );

    requiredResearch.set(ProjectileLauncherID, ProjectileLauncherResearchID);

    //HardenedDrillID
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HardenedDrillID,
      TitaniumResourceItemID,
      100,
      IronPlateCraftedItemID,
      10,
      BasicPowerSourceCraftedItemID,
      5
    );

    requiredResearch.set(HardenedDrillID, HardenedDrillResearchID);

    //DenseMetalRefineryID
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      DenseMetalRefineryID,
      OsmiumResourceItemID,
      50,
      TitaniumResourceItemID,
      100,
      IronPlateCraftedItemID,
      30,
      BasicPowerSourceCraftedItemID,
      10
    );

    requiredResearch.set(DenseMetalRefineryID, DenseMetalRefineryResearchID);

    //AdvancedBatteryFactoryID
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      AdvancedBatteryFactoryID,
      OsmiumResourceItemID,
      150,
      TitaniumResourceItemID,
      50,
      BasicPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(AdvancedBatteryFactoryID, AdvancedBatteryFactoryResearchID);

    //HighTempFoundryID
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighTempFoundryID,
      TungstenResourceItemID,
      50,
      RefinedOsmiumCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      20
    );

    requiredResearch.set(HighTempFoundryID, HighTempFoundryResearchID);

    //PrecisionMachineryFactoryID
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionMachineryFactoryID,
      IridiumResourceItemID,
      50,
      TungstenRodsCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(PrecisionMachineryFactoryID, PrecisionMachineryFactoryResearchID);

    //IridiumDrillbitFactoryID
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IridiumDrillbitFactoryID,
      TungstenRodsCraftedItemID,
      50,
      LaserPowerSourceCraftedItemID,
      5
    );

    requiredResearch.set(IridiumDrillbitFactoryID, IridiumDrillbitFactoryResearchID);

    //PrecisionPneumaticDrillID
    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionPneumaticDrillID,
      TungstenResourceItemID,
      100,
      OsmiumResourceItemID,
      100,
      LaserPowerSourceCraftedItemID,
      5
    );
    requiredResearch.set(PrecisionPneumaticDrillID, PrecisionPneumaticDrillResearchID);

    //PenetratorFactoryID
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratorFactoryID,
      OsmiumResourceItemID,
      200,
      IronPlateCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(PenetratorFactoryID, PenetratorFactoryResearchID);

    //PenetratingMissileFactoryID
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratingMissileFactoryID,
      OsmiumResourceItemID,
      300,
      TitaniumResourceItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      15
    );
    requiredResearch.set(PenetratingMissileFactoryID, PenetratingMissileFactoryResearchID);

    //MissileLaunchComplexID
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      MissileLaunchComplexID,
      TungstenRodsCraftedItemID,
      100,
      OsmiumResourceItemID,
      100
    );
    requiredResearch.set(MissileLaunchComplexID, MissileLaunchComplexResearchID);

    //HighEnergyLaserFactoryID
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighEnergyLaserFactoryID,
      IridiumCrystalCraftedItemID,
      50,
      RefinedOsmiumCraftedItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      50
    );
    requiredResearch.set(HighEnergyLaserFactoryID, HighEnergyLaserFactoryResearchID);

    //ThermobaricWarheadFactory
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ThermobaricWarheadFactoryID,
      RefinedOsmiumCraftedItemID,
      200,
      IridiumCrystalCraftedItemID,
      100,
      LaserPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(ThermobaricWarheadFactoryID, ThermobaricWarheadFactoryResearchID);

    //ThermobaricMissileFactoryID
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ThermobaricMissileFactoryID,
      IridiumCrystalCraftedItemID,
      100,
      TungstenRodsCraftedItemID,
      100,
      LaserPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);

    //KimberliteCatalystFactoryID
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KimberliteCatalystFactoryID,
      IridiumCrystalCraftedItemID,
      200,
      LaserPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(KimberliteCatalystFactoryID, KimberliteCatalystFactoryResearchID);
  }
}
