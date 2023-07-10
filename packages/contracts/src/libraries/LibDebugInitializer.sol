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
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { BlueprintComponent as BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetMineBuildingProductionForLevel } from "../libraries/LibSetMineBuildingProductionForLevel.sol";
import { LibSetFactoryProductionForLevel } from "../libraries/LibSetFactoryProductionForLevel.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";
//tiles
import { IronID, CopperID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

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
uint256 constant DebugCopperMineID = uint256(keccak256("block.DebugCopperMine"));
uint256 constant DebugIronMineWithBuildLimitID = uint256(keccak256("block.DebugIronMineWithBuildLimit"));
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

//storage building
uint256 constant DebugStorageBuildingID = uint256(keccak256("block.DebugStorageBuilding"));

// the purpose of this lib is to define and initialize debug buildings that can be used for testing
// so additions and removal of actual game design elements don't effect the already written tests
library LibDebugInitializer {
  function init(IWorld world) internal {
    //should only work if debug is enabled
    if (!LibDebug.isDebug()) return;

    BlueprintComponent blueprintComponent = BlueprintComponent(
      getAddressById(world.components(), BlueprintComponentID)
    );
    int32[] memory coords = new int32[](2);
    coords[0] = 0;
    coords[1] = 0;

    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingNoReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingResourceReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingResearchReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingBuildLimitReq, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingTileReqID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingWithUpgradeResourceReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingWithUpgradeResearchReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugIronMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugCopperMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugIronMineWithBuildLimitID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugIronMineNoTileReqID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugIronPlateFactoryNoMineReqID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugIronPlateFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSuperIronMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSuperIronPlateFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleTechnologyNoReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleTechnologyResourceReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleTechnologyResearchReqsID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleTechnologyMainBaseLevelReqsID, coords);

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
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));
    //initialize simple buildings
    initializeSimpleBuildings(
      itemComponent,
      requiredResearch,
      requiredResourcesComponent,
      ignoreBuildLimitComponent,
      tileComponent,
      maxLevelComponent
    );

    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    //initialize Mines
    initializeMines(ignoreBuildLimitComponent, tileComponent, mineComponent, maxLevelComponent);

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    //initialize factories
    initializeFactories(
      ignoreBuildLimitComponent,
      factoryProductionComponent,
      factoryMineBuildingsComponent,
      maxLevelComponent,
      storageCapacityResourcesComponent,
      storageCapacityComponent
    );

    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    //initialize technologies
    initializeTechnologies(
      researchComponent,
      itemComponent,
      buildingComponent,
      requiredResearch,
      requiredResourcesComponent
    );

    initializeStorageBuildings(
      ignoreBuildLimitComponent,
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      maxLevelComponent
    );
  }

  function initializeSimpleBuildings(
    ItemComponent itemComponent,
    RequiredResearchComponent requiredResearch,
    RequiredResourcesComponent requiredResourcesComponent,
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    TileComponent tileComponent,
    MaxLevelComponent maxLevelComponent
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
    maxLevelComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID, 4);
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
    maxLevelComponent.set(DebugSimpleBuildingWithUpgradeResearchReqsID, 2);
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
    MineComponent mineComponent,
    MaxLevelComponent maxLevelComponent
  ) internal {
    // DebugIronMineID
    ignoreBuildLimitComponent.set(DebugIronMineID);
    tileComponent.set(DebugIronMineID, IronID);
    maxLevelComponent.set(DebugIronMineID, 3);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 1, 1);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 2, 2);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugIronMineID, 3, 3);

    // DebugIronMineNoTileReqID
    ignoreBuildLimitComponent.set(DebugIronMineNoTileReqID);
    maxLevelComponent.set(DebugIronMineNoTileReqID, 3);
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

    //DebugIronMineWithBuildLimitID
    maxLevelComponent.set(DebugIronMineWithBuildLimitID, 3);
    tileComponent.set(DebugIronMineWithBuildLimitID, IronID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      1,
      1
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      2,
      2
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      3,
      3
    );

    //DebugCopperMineID
    maxLevelComponent.set(DebugCopperMineID, 3);
    tileComponent.set(DebugCopperMineID, CopperID);
    ignoreBuildLimitComponent.set(DebugCopperMineID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 1, 1);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 2, 2);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 3, 3);
  }

  function initializeFactories(
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    FactoryProductionComponent factoryProductionComponent,
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    MaxLevelComponent maxLevelComponent,
    StorageCapacityResourcesComponent storageCapacityResourcesComponent,
    StorageCapacityComponent storageCapacityComponent
  ) internal {
    //DebugIronPlateFactoryNoMineReqID
    maxLevelComponent.set(DebugIronPlateFactoryNoMineReqID, 3);
    ignoreBuildLimitComponent.set(DebugIronPlateFactoryNoMineReqID);

    //set a storage amount for IronPlateCraftedItemID to stream line usage
    LibSetRequiredResources.set1RequiredResourceForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 1),
      IronPlateCraftedItemID,
      1000
    );
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
    LibSetRequiredResources.set1RequiredResourceForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1),
      IronPlateCraftedItemID,
      1000
    );
    ignoreBuildLimitComponent.set(DebugIronPlateFactoryID);
    maxLevelComponent.set(DebugIronPlateFactoryID, 3);
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
      DebugIronPlateFactoryID,
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
      DebugIronPlateFactoryID,
      2,
      IronPlateCraftedItemID,
      2
    );

    //DebugIronPlateFactoryID level 3
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      3,
      DebugIronMineID,
      2
    );
    LibSetFactoryProductionForLevel.setFactoryProductionForLevel(
      factoryProductionComponent,
      DebugIronPlateFactoryID,
      3,
      IronPlateCraftedItemID,
      3
    );
  }

  function initializeTechnologies(
    ResearchComponent researchComponent,
    ItemComponent itemComponent,
    BuildingComponent buildingComponent,
    RequiredResearchComponent requiredResearchComponent,
    RequiredResourcesComponent requiredResourcesComponent
  ) internal {
    // DebugSimpleTechnologyNoReqsID
    researchComponent.set(DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);
    researchComponent.set(DebugSimpleTechnologyResearchReqsID);
    //DebugSimpleTechnologyResourceReqsID
    researchComponent.set(DebugSimpleTechnologyResourceReqsID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleTechnologyResourceReqsID,
      IronResourceItemID,
      100
    );

    //DebugSimpleTechnologyMainBaseLevelReqsID
    researchComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    buildingComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);
  }

  function initializeStorageBuildings(
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    StorageCapacityResourcesComponent storageCapacityResourcesComponent,
    StorageCapacityComponent storageCapacityComponent,
    MaxLevelComponent maxLevelComponent
  ) internal {
    //DebugStorageBuildingID
    ignoreBuildLimitComponent.set(DebugStorageBuildingID);
    maxLevelComponent.set(DebugStorageBuildingID, 2);
    //DebugStorageBuildingID level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 1);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      200
    );
    //DebugStorageBuildingID level 2
    buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 2);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      200,
      CopperResourceItemID,
      200
    );
  }
}
