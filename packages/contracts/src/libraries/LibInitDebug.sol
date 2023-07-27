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
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { BlueprintComponent as BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
import { LibSetRequiredResourcesUpgrade } from "../libraries/LibSetRequiredResourcesUpgrade.sol";
import { LibSetMineBuildingProductionForLevel } from "../libraries/LibSetMineBuildingProductionForLevel.sol";
import { LibSetProductionForLevel } from "../libraries/LibSetProductionForLevel.sol";
import { LibSetFactoryMineRequirements } from "../libraries/LibSetFactoryMineRequirements.sol";

import "../prototypes.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

// Research
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

bool constant DEBUG = true;

// the purpose of this lib is to define and initialize debug buildings that can be used for testing
// so additions and removal of actual game design elements don't effect the already written tests
library LibDebugInitializer {
  function init(IWorld world) internal {
    //should only work if debug is enabled
    if (DEBUG) IsDebugComponent(getAddressById(world.components(), IsDebugComponentID)).set(SingletonID);

    initializeSimpleBuildings(world);

    initializeMines(world);

    initializeFactories(world);

    initializeTechnologies(world);

    initializeStorageBuildings(world);
  }

  function initBlueprints(IWorld world) internal {
    BlueprintComponent blueprintComponent = BlueprintComponent(world.getComponent(BlueprintComponentID));
    int32[] memory coords = LibBlueprint.get1x1Blueprint();
    blueprintComponent.set(DebugSimpleBuildingNoReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingResourceReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingResearchReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingBuildLimitReq, coords);
    blueprintComponent.set(DebugSimpleBuildingTileReqID, coords);
    blueprintComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingWithUpgradeResearchReqsID, coords);
    blueprintComponent.set(DebugIronMineID, coords);
    blueprintComponent.set(DebugCopperMineID, coords);
    blueprintComponent.set(DebugIronMineWithBuildLimitID, coords);
    blueprintComponent.set(DebugIronMineNoTileReqID, coords);
    blueprintComponent.set(DebugIronPlateFactoryNoMineReqID, coords);
    blueprintComponent.set(DebugIronPlateFactoryID, coords);
    blueprintComponent.set(DebugSuperIronMineID, coords);
    blueprintComponent.set(DebugSuperIronPlateFactoryID, coords);
    blueprintComponent.set(DebugSimpleTechnologyNoReqsID, coords);
    blueprintComponent.set(DebugSimpleTechnologyResourceReqsID, coords);
    blueprintComponent.set(DebugSimpleTechnologyResearchReqsID, coords);
    blueprintComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, coords);
    blueprintComponent.set(DebugStorageBuildingID, coords);

    blueprintComponent.set(DebugPassiveProductionBuilding, coords);
    blueprintComponent.set(DebugSimpleBuildingPassiveResourceRequirement, coords);
    blueprintComponent.set(DebugLithiumMineID, coords);
    blueprintComponent.set(DebugAlloyFactoryID, coords);
    blueprintComponent.set(DebugLithiumCopperOxideFactoryID, coords);
    blueprintComponent.set(DebugSolarPanelID, coords);
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

    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(components, RequiredPassiveComponentID)
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
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResearchReqsID, 2);
    RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
      LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, buildingIdLevel),
      DebugSimpleTechnologyNoReqsID
    );

    //DebugSimpleBuildingPassiveResourceRequirement
    ignoreBuildLimitComponent.set(DebugSimpleBuildingPassiveResourceRequirement);
    ResourceValues memory requiredPassiveData = ResourceValues(new uint256[](1), new uint32[](1));
    requiredPassiveData.resources[0] = ElectricityPassiveResourceID;
    requiredPassiveData.values[0] = 2;
    requiredPassiveComponent.set(DebugSimpleBuildingPassiveResourceRequirement, requiredPassiveData);
  }

  function initializeMines(IWorld world) internal {
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(world.components(), IgnoreBuildLimitComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(world.components(), BuildingTypeComponentID)
    );
    MineProductionComponent mineProductionComponent = MineProductionComponent(
      getAddressById(world.components(), MineProductionComponentID)
    );
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
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineID,
      1,
      1
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineID,
      2,
      2
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineID,
      3,
      3
    );

    // DebugIronMineNoTileReqID
    ignoreBuildLimitComponent.set(DebugIronMineNoTileReqID);
    maxLevelComponent.set(DebugIronMineNoTileReqID, 3);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineNoTileReqID,
      1,
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineNoTileReqID,
      2,
      7
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineNoTileReqID,
      3,
      10
    );

    //DebugIronMineWithBuildLimitID
    maxLevelComponent.set(DebugIronMineWithBuildLimitID, 3);
    buildingTypeComponent.set(DebugIronMineWithBuildLimitID, IronID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineWithBuildLimitID,
      1,
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineWithBuildLimitID,
      2,
      7
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugIronMineWithBuildLimitID,
      3,
      10
    );

    //DebugCopperMineID
    maxLevelComponent.set(DebugCopperMineID, 3);
    buildingTypeComponent.set(DebugCopperMineID, CopperID);
    ignoreBuildLimitComponent.set(DebugCopperMineID);
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugCopperMineID,
      1,
      3
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugCopperMineID,
      2,
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugCopperMineID,
      3,
      7
    );
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
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugLithiumMineID,
      1,
      3
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugLithiumMineID,
      2,
      5
    );
    LibSetMineBuildingProductionForLevel.setMineBuildingProductionForLevel(
      mineProductionComponent,
      DebugLithiumMineID,
      3,
      7
    );
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
    MinesComponent minesComponent = MinesComponent(getAddressById(components, MinesComponentID));
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getAddressById(components, MaxResourceStorageComponentID)
    );

    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(components, PassiveProductionComponentID)
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
      minesComponent,
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
      minesComponent,
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
      minesComponent,
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

    //DebugPassiveProductionBuilding
    ignoreBuildLimitComponent.set(DebugPassiveProductionBuilding);
    passiveProductionComponent.set(DebugPassiveProductionBuilding, ResourceValue(ElectricityPassiveResourceID, 10));

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
      minesComponent,
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
      minesComponent,
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
    passiveProductionComponent.set(DebugSolarPanelID, ResourceValue(ElectricityPassiveResourceID, 10));
  }

  function initializeTechnologies(IWorld world) internal {
    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(
      world.getComponent(HasResearchedComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      world.getComponent(RequiredResearchComponentID)
    );
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    // DebugSimpleTechnologyNoReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);
    hasResearchedComponent.set(DebugSimpleTechnologyResearchReqsID);
    //DebugSimpleTechnologyResourceReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyResourceReqsID);
    /****************** Required Resources *******************/
    uint256 techLevel1Entity = LibEncode.hashKeyEntity(DebugSimpleTechnologyResourceReqsID, 1);

    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, techLevel1Entity, resourceValues);

    //DebugSimpleTechnologyMainBaseLevelReqsID
    hasResearchedComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    levelComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);
  }

  function initializeStorageBuildings(IWorld world) internal {
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      world.getComponent(IgnoreBuildLimitComponentID)
    );
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(world.getComponent(MaxLevelComponentID));
    //DebugStorageBuildingID
    ignoreBuildLimitComponent.set(DebugStorageBuildingID);
    maxLevelComponent.set(DebugStorageBuildingID, 2);
    //DebugStorageBuildingID level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 1);

    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 200 });

    LibSetBuildingReqs.setStorageUpgrades(world, buildingIdLevel, resourceValues);
    //DebugStorageBuildingID level 2

    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 200 });
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 200 });

    buildingIdLevel = LibEncode.hashKeyEntity(DebugStorageBuildingID, 2);
    LibSetBuildingReqs.setStorageUpgrades(world, buildingIdLevel, resourceValues);
  }
}
