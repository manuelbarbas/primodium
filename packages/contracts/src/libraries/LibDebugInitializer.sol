// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ProductionData } from "components/ProductionComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { BlueprintComponent as BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID, RequiredPassiveResourceData } from "components/RequiredPassiveResourceComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, PassiveResourceProductionData } from "components/PassiveResourceProductionComponent.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";
import { LibSetUpgradeResearchRequirements } from "../libraries/LibSetUpgradeResearchRequirements.sol";
import { LibSetMineBuildingProductionForLevel } from "../libraries/LibSetMineBuildingProductionForLevel.sol";
import { LibSetProductionForLevel } from "../libraries/LibSetProductionForLevel.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";

import "../prototypes.sol";

// Research
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

//buildings
uint256 constant DebugSimpleBuildingNoReqsID = uint256(keccak256("block.DebugSimpleBuildingNoReqs"));
uint256 constant DebugSimpleBuildingResourceReqsID = uint256(keccak256("block.DebugSimpleBuildingResourceReqs"));
uint256 constant DebugSimpleBuildingResearchReqsID = uint256(keccak256("block.DebugSimpleBuildingResearchReqs"));
uint256 constant DebugSimpleBuildingBuildLimitReq = uint256(keccak256("block.DebugSimpleBuildingBuildLimitReq"));
uint256 constant DebugSimpleBuildingTileReqID = uint256(keccak256("block.DebugSimpleBuildingTileReq"));

uint256 constant DebugSimpleBuildingPassiveResourceRequirement = uint256(
  keccak256("block.DebugSimpleBuildingPassiveResourceRequirement")
);

uint256 constant DebugSimpleBuildingWithUpgradeResourceReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResourceReqs")
);
uint256 constant DebugSimpleBuildingWithUpgradeResearchReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResearchReqs")
);

// mines
uint256 constant DebugIronMineID = uint256(keccak256("block.DebugIronMine"));
uint256 constant DebugCopperMineID = uint256(keccak256("block.DebugCopperMine"));
uint256 constant DebugLithiumMineID = uint256(keccak256("block.DebugLithiumMine"));

uint256 constant DebugIronMineWithBuildLimitID = uint256(keccak256("block.DebugIronMineWithBuildLimit"));
uint256 constant DebugIronMineNoTileReqID = uint256(keccak256("block.DebugIronMineNoTileReq"));

//factories
uint256 constant DebugIronPlateFactoryNoMineReqID = uint256(keccak256("block.DebugIronPlateFactoryNoMineReq"));
uint256 constant DebugIronPlateFactoryID = uint256(keccak256("block.DebugIronPlateFactory"));
uint256 constant DebugAlloyFactoryID = uint256(keccak256("block.DebugAlloyFactory"));
uint256 constant DebugLithiumCopperOxideFactoryID = uint256(keccak256("block.DebugLithiumCopperOxideFactory"));

uint256 constant DebugSolarPanelID = uint256(keccak256("block.DebugSolarPanel"));

uint256 constant DebugPassiveResourceProductionBuilding = uint256(
  keccak256("block.DebugPassiveResourceProductionBuilding")
);

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
    IsDebugComponent(getAddressById(world.components(), IsDebugComponentID)).set(SingletonID);

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
    LibBlueprint.createBlueprint(blueprintComponent, DebugStorageBuildingID, coords);

    LibBlueprint.createBlueprint(blueprintComponent, DebugPassiveResourceProductionBuilding, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSimpleBuildingPassiveResourceRequirement, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugLithiumMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugAlloyFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugLithiumCopperOxideFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DebugSolarPanelID, coords);

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
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));
    //initialize simple buildings
    initializeSimpleBuildings(world);

    //initialize Mines
    initializeMines(world);

    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getAddressById(components, MaxResourceStorageComponentID)
    );
    //initialize factories
    initializeFactories(world);

    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));
    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(
      getAddressById(components, HasResearchedComponentID)
    );
    //initialize technologies
    initializeTechnologies(
      hasResearchedComponent,
      itemComponent,
      levelComponent,
      requiredResearch,
      requiredResourcesComponent
    );

    initializeStorageBuildings(
      ignoreBuildLimitComponent,
      maxResourceStorageComponent,
      maxStorageComponent,
      maxLevelComponent
    );
  }

  function initializeSimpleBuildings(IWorld world) internal {
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
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(components, RequiredPassiveResourceComponentID)
    );
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
    buildingTypeComponent.set(DebugSimpleBuildingTileReqID, IronID);

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

    //DebugSimpleBuildingPassiveResourceRequirement
    ignoreBuildLimitComponent.set(DebugSimpleBuildingPassiveResourceRequirement);
    RequiredPassiveResourceData memory requiredPassiveResourceData = RequiredPassiveResourceData({
      ResourceIDs: new uint256[](1),
      RequiredAmounts: new uint32[](1)
    });
    requiredPassiveResourceData.ResourceIDs[0] = ElectricityPassiveResourceID;
    requiredPassiveResourceData.RequiredAmounts[0] = 2;
    requiredPassiveResourceComponent.set(DebugSimpleBuildingPassiveResourceRequirement, requiredPassiveResourceData);
  }

  function initializeMines(IWorld world) internal {
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(world.components(), IgnoreBuildLimitComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(world.components(), BuildingTypeComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(world.components(), MineComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(world.components(), MaxLevelComponentID));
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(
      getAddressById(world.components(), MaxStorageComponentID)
    );
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getAddressById(world.components(), MaxResourceStorageComponentID)
    );
    // DebugIronMineID
    ignoreBuildLimitComponent.set(DebugIronMineID);
    buildingTypeComponent.set(DebugIronMineID, IronID);
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
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineNoTileReqID,
      2,
      7
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineNoTileReqID,
      3,
      10
    );

    //DebugIronMineWithBuildLimitID
    maxLevelComponent.set(DebugIronMineWithBuildLimitID, 3);
    buildingTypeComponent.set(DebugIronMineWithBuildLimitID, IronID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      1,
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      2,
      7
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineComponent,
      DebugIronMineWithBuildLimitID,
      3,
      10
    );

    //DebugCopperMineID
    maxLevelComponent.set(DebugCopperMineID, 3);
    buildingTypeComponent.set(DebugCopperMineID, CopperID);
    ignoreBuildLimitComponent.set(DebugCopperMineID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 1, 3);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 2, 5);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugCopperMineID, 3, 7);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      LibEncode.hashKeyEntity(DebugCopperMineID, 1),
      CopperResourceItemID,
      1000
    );

    maxLevelComponent.set(DebugLithiumMineID, 3);
    buildingTypeComponent.set(DebugLithiumMineID, LithiumID);
    ignoreBuildLimitComponent.set(DebugLithiumMineID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugLithiumMineID, 1, 3);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugLithiumMineID, 2, 5);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(mineComponent, DebugLithiumMineID, 3, 7);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      LibEncode.hashKeyEntity(DebugLithiumMineID, 1),
      CopperResourceItemID,
      1000
    );
  }

  function initializeFactories(IWorld world) internal {
    IUint256Component components = world.components();

    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );

    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));
    ProductionComponent productionComponent = ProductionComponent(getAddressById(components, ProductionComponentID));
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getAddressById(components, MaxResourceStorageComponentID)
    );

    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(components, PassiveResourceProductionComponentID)
    );
    //DebugIronPlateFactoryNoMineReqID
    maxLevelComponent.set(DebugIronPlateFactoryNoMineReqID, 3);
    ignoreBuildLimitComponent.set(DebugIronPlateFactoryNoMineReqID);

    //set a storage amount for IronPlateCraftedItemID to stream line usage
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 1),
      IronPlateCraftedItemID,
      1000
    );
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryNoMineReqID,
      1,
      IronPlateCraftedItemID,
      2
    );

    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryNoMineReqID,
      2,
      IronPlateCraftedItemID,
      4
    );

    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryNoMineReqID,
      3,
      IronPlateCraftedItemID,
      6
    );

    //DebugIronPlateFactoryID
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
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
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryID,
      1,
      IronPlateCraftedItemID,
      2
    );
    //DebugIronPlateFactoryID level 2
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      2,
      DebugIronMineID,
      1
    );
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryID,
      2,
      IronPlateCraftedItemID,
      4
    );

    //DebugIronPlateFactoryID level 3
    LibSetFactoryMineRequirements.setFactory1MineRequirement(
      factoryMineBuildingsComponent,
      DebugIronPlateFactoryID,
      3,
      DebugIronMineID,
      2
    );
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      DebugIronPlateFactoryID,
      3,
      IronPlateCraftedItemID,
      6
    );

    //DebugPassiveResourceProductionBuilding
    ignoreBuildLimitComponent.set(DebugPassiveResourceProductionBuilding);
    passiveResourceProductionComponent.set(
      DebugPassiveResourceProductionBuilding,
      PassiveResourceProductionData(ElectricityPassiveResourceID, 10)
    );

    //DebugAlloyFactoryID
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      LibEncode.hashKeyEntity(DebugAlloyFactoryID, 1),
      AlloyCraftedItemID,
      1000
    );
    ignoreBuildLimitComponent.set(DebugAlloyFactoryID);
    //DebugAlloyFactoryID level 1
    LibSetFactoryMineRequirements.setFactory2MineRequirement(
      factoryMineBuildingsComponent,
      DebugAlloyFactoryID,
      1,
      DebugIronMineID,
      1,
      DebugCopperMineID,
      1
    );
    LibSetProductionForLevel.setProductionForLevel(productionComponent, DebugAlloyFactoryID, 1, AlloyCraftedItemID, 1);

    //LithiumCopperOxideFactoryID
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      LibEncode.hashKeyEntity(LithiumCopperOxideFactoryID, 1),
      LithiumCopperOxideCraftedItemID,
      1000
    );
    ignoreBuildLimitComponent.set(LithiumCopperOxideFactoryID);
    //LithiumCopperOxideFactoryID level 1
    LibSetFactoryMineRequirements.setFactory2MineRequirement(
      factoryMineBuildingsComponent,
      LithiumCopperOxideFactoryID,
      1,
      DebugLithiumMineID,
      1,
      DebugCopperMineID,
      1
    );
    LibSetProductionForLevel.setProductionForLevel(
      productionComponent,
      LithiumCopperOxideFactoryID,
      1,
      LithiumCopperOxideCraftedItemID,
      2
    );

    //DebugSolarPanelID
    ignoreBuildLimitComponent.set(DebugSolarPanelID);
    passiveResourceProductionComponent.set(
      DebugSolarPanelID,
      PassiveResourceProductionData(ElectricityPassiveResourceID, 10)
    );
  }

  function initializeTechnologies(
    HasResearchedComponent hasResearchedComponent,
    ItemComponent itemComponent,
    LevelComponent levelComponent,
    RequiredResearchComponent requiredResearchComponent,
    RequiredResourcesComponent requiredResourcesComponent
  ) internal {
    // DebugSimpleTechnologyNoReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);
    hasResearchedComponent.set(DebugSimpleTechnologyResearchReqsID);
    //DebugSimpleTechnologyResourceReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyResourceReqsID);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      DebugSimpleTechnologyResourceReqsID,
      IronResourceItemID,
      100
    );

    //DebugSimpleTechnologyMainBaseLevelReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    levelComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);
  }

  function initializeStorageBuildings(
    IgnoreBuildLimitComponent ignoreBuildLimitComponent,
    MaxResourceStorageComponent maxResourceStorageComponent,
    MaxStorageComponent maxStorageComponent,
    MaxLevelComponent maxLevelComponent
  ) internal {
    //DebugStorageBuildingID
    ignoreBuildLimitComponent.set(DebugStorageBuildingID);
    maxLevelComponent.set(DebugStorageBuildingID, 2);
    //DebugStorageBuildingID level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 1);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      200
    );
    //DebugStorageBuildingID level 2
    buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 2);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      maxResourceStorageComponent,
      maxStorageComponent,
      buildingIdLevel,
      IronResourceItemID,
      200,
      CopperResourceItemID,
      200
    );
  }
}
