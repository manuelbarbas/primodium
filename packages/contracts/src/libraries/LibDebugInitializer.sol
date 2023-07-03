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
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetMineBuildingProductionForLevel } from "../libraries/LibSetMineBuildingProductionForLevel.sol";
import { LibSetFactoryProductionForLevel } from "../libraries/LibSetFactoryProductionForLevel.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";
//tiles
import { IronID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

//buildings
uint256 constant DebugSimpleBuildingNoReqsID = uint256(keccak256("block.DebugSimpleBuildingNoReqs"));
uint256 constant DebugSimpleBuildingResourceReqsID = uint256(keccak256("block.DebugSimpleBuildingResourceReqs"));
uint256 constant DebugSimpleBuildingResearchReqsID = uint256(keccak256("block.DebugSimpleBuildingResearchReqs"));
uint256 constant DebugSimpleBuildingBuildLimitReq = uint256(keccak256("block.DebugSimpleBuildingBuildLimitReq"));
uint256 constant DebugSimpleBuildingTileReqID = uint256(keccak256("block.DebugSimpleBuildingTileReq"));

uint256 constant DebugSimpleBuildingWithUpgradeResourceReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResourceReqs")
);
uint256 constant DebugSimpleBuildingWithUpgradeResearchReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResearchReqs")
);

// mines
uint256 constant DebugIronMineID = uint256(keccak256("block.DebugIronMine"));
uint256 constant DebugIronMineNoTileReqID = uint256(keccak256("block.DebugIronMineNoTileReq"));

//factories
uint256 constant DebugIronPlateFactoryNoMineReqID = uint256(keccak256("block.DebugIronPlateFactoryNoMineReq"));
uint256 constant DebugIronPlateFactoryID = uint256(keccak256("block.DebugIronPlateFactory"));

//super buildings
uint256 constant DebugSuperIronMineID = uint256(keccak256("block.DebugSuperIronMine"));
uint256 constant DebugSuperIronPlateFactoryID = uint256(keccak256("block.DebugSuperIronPlateFactory"));
//technologies
uint256 constant DebugSimpleTechnologyNoReqsID = uint256(keccak256("block.DebugSimpleTechnologyNoReqs"));
uint256 constant DebugSimpleTechnologyResourceReqsID = uint256(keccak256("block.DebugSimpleTechnologyResourceReqs"));
uint256 constant DebugSimpleTechnologyResearchReqsID = uint256(keccak256("block.DebugSimpleTechnologyResearchReqs"));
uint256 constant DebugSimpleTechnologyMainBaseLevelReqsID = uint256(
  keccak256("block.DebugSimpleTechnologyMainBaseLevelReqs")
);

// the purpose of this lib is to define and initialize debug buildings that can be used for testing
// so additions and removal of actual game design elements don't effect the already written tests
library LibDebugInitializer {
  function init(IWorld world) internal {
    //should only work if debug is enabled
    if (!LibDebug.isDebug()) return;
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    //initialize simple buildings
    initializeSimpleBuildings(
      itemComponent,
      requiredResearch,
      requiredResourcesComponent,
      ignoreBuildLimitComponent,
      tileComponent
    );

    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    //initialize Mines
    initializeMines(ignoreBuildLimitComponent, tileComponent, mineComponent);

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    //initialize factories
    initializeFactories(ignoreBuildLimitComponent, factoryProductionComponent, factoryMineBuildingsComponent);

    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    //initialize technologies
    initializeTechnologies(itemComponent, buildingComponent, requiredResearch, requiredResourcesComponent);
  }

  function initializeSimpleBuildings(
    ItemComponent itemComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResourcesComponent,
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    TileComponent tileComponent
  ) internal {
    // DebugSimpleBuildingNoReqsID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingNoReqsID);

    // DebugSimpleBuildingResourceReqsID
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleBuildingResourceReqsID,
      IronResourceItemID,
      100
    );
    ignoreBuildLimitComponent.set(DebugSimpleBuildingResourceReqsID);

    // DebugSimpleBuildingResearchReqsID
    requiredResearch.set(DebugSimpleBuildingResearchReqsID, DebugSimpleTechnologyNoReqsID);
    ignoreBuildLimitComponent.set(DebugSimpleBuildingResearchReqsID);

    // DebugSimpleBuildingBuildLimitReq do nothing

    // DebugSimpleBuildingTileReqID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingTileReqID);
    tileComponent.set(DebugSimpleBuildingTileReqID, IronID);

    //DebugSimpleBuildingWithUpgradeResourceReqsID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID);

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 2
    LibSetRequiredResourcesUpgrade.set1RequiredResourcesForEntityUpgradeToLevel(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleBuildingWithUpgradeResourceReqsID,
      IronResourceItemID,
      100,
      2
    );

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 3
    LibSetRequiredResourcesUpgrade.set2RequiredResourcesForEntityUpgradeToLevel(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleBuildingWithUpgradeResourceReqsID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      100,
      3
    );

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 4
    LibSetRequiredResourcesUpgrade.set3RequiredResourcesForEntityUpgradeToLevel(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleBuildingWithUpgradeResourceReqsID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      100,
      LithiumResourceItemID,
      100,
      4
    );

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 4
    LibSetRequiredResourcesUpgrade.set4RequiredResourcesForEntityUpgradeToLevel(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleBuildingWithUpgradeResourceReqsID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      100,
      LithiumResourceItemID,
      100,
      OsmiumResourceItemID,
      100,
      4
    );

    //DebugSimpleBuildingWithUpgradeResearchReqsID
    LibSetUpgradeResearchRequirements.setRequiredResearchForEntityUpgradeToLevel(
      requiredResearch,
      DebugSimpleBuildingWithUpgradeResearchReqsID,
      DebugSimpleTechnologyNoReqsID,
      2
    );
  }

  function initializeMines(
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    TileComponent tileComponent,
    MineComponent mineComponent
  ) internal {
    // DebugIronMineID
    ignoreBuildLimitComponent.set(DebugIronMineID);
    tileComponent.set(DebugIronMineID, IronID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 1, 1);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 2, 2);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 3, 3);

    // DebugIronMineNoTileReqID
    ignoreBuildLimitComponent.set(DebugIronMineNoTileReqID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineNoTileReqID,
      1,
      1
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineNoTileReqID,
      2,
      2
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineNoTileReqID,
      3,
      3
    );
  }

  function initializeFactories(
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    FactoryProductionComponent factoryProductionComponent,
    FactoryMineBuildingsComponent factoryMineBuildingsComponent
  ) internal {
    //DebugIronPlateFactoryNoMineReqID
    ignoreBuildLimitComponent.set(DebugIronPlateFactoryNoMineReqID);
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      1,
      IronPlateCraftedItemID,
      1
    );

    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      2,
      IronPlateCraftedItemID,
      2
    );

    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      3,
      IronPlateCraftedItemID,
      3
    );

    //DebugIronPlateFactoryID
    ignoreBuildLimitComponent.set(DebugIronPlateFactoryNoMineReqID);

    //DebugIronPlateFactoryID level 1
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      1,
      DebugIronMineID,
      1
    );
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      1,
      IronPlateCraftedItemID,
      1
    );
    //DebugIronPlateFactoryID level 2
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      2,
      DebugIronMineID,
      1
    );
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      2,
      IronPlateCraftedItemID,
      2
    );

    //DebugIronPlateFactoryID level 2
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      3,
      DebugIronMineID,
      2
    );
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryNoMineReqID,
      3,
      IronPlateCraftedItemID,
      3
    );
  }

  function initializeTechnologies(
    ItemComponent itemComponent,
    BuildingComponent buildingComponent,
    RequiredResearchComponent requiredResearchComponent,
    RequiredResourcesComponent requiredResourcesComponent
  ) internal {
    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResourceReqsID
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleTechnologyResourceReqsID,
      IronResourceItemID,
      100
    );

    //DebugSimpleTechnologyMainBaseLevelReqsID
    buildingComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);
  }
}
