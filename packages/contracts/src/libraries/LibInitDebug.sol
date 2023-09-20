// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// Production Buildings
import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_BlueprintComponent as P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";

import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { P_UnitProductionMultiplierComponent, ID as P_UnitProductionMultiplierComponentID } from "components/P_UnitProductionMultiplierComponent.sol";
import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { P_UnitTrainingTimeComponent, ID as P_UnitTrainingTimeComponentID } from "components/P_UnitTrainingTimeComponent.sol";
import { P_UnitAttackComponent, ID as P_UnitAttackComponentID } from "components/P_UnitAttackComponent.sol";
import { P_UnitDefenceComponent, ID as P_UnitDefenceComponentID } from "components/P_UnitDefenceComponent.sol";
import { P_UnitCargoComponent, ID as P_UnitCargoComponentID } from "components/P_UnitCargoComponent.sol";
import { P_UnitMiningComponent, ID as P_UnitMiningComponentID } from "components/P_UnitMiningComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

import "../prototypes.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

// Research
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

// the purpose of this lib is to define and initialize debug buildings that can be used for testing
// so additions and removal of actual game design elements don't effect the already written tests
library LibInitDebug {
  function init(IWorld world) internal {
    //should only work if debug is enabled
    IsDebugComponent(world.getComponent(IsDebugComponentID)).set(SingletonID);

    initBlueprints(world);
    registerBuildingTypes(world);
    initializeSimpleBuildings(world);

    initializeMines(world);

    initializeFactories(world);

    initializeTechnologies(world);

    initializeStorageBuildings(world);

    initUtilityBuildings(world);

    initializeUnitProductionBuildings(world);

    initializeUnits(world);

    registerUnitType(world);
  }

  function registerBuildingTypes(IWorld world) internal {
    P_IsBuildingTypeComponent isBuildingTypeComponent = P_IsBuildingTypeComponent(
      world.getComponent(P_IsBuildingTypeComponentID)
    );
    isBuildingTypeComponent.set(DebugSimpleBuildingNoReqsID);
    isBuildingTypeComponent.set(DebugSimpleBuildingResourceReqsID);
    isBuildingTypeComponent.set(DebugSimpleBuildingResearchReqsID);
    isBuildingTypeComponent.set(DebugSimpleBuildingBuildLimitReq);
    isBuildingTypeComponent.set(DebugSimpleBuildingTileReqID);
    isBuildingTypeComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID);
    isBuildingTypeComponent.set(DebugSimpleBuildingWithUpgradeResearchReqsID);
    isBuildingTypeComponent.set(DebugSimpleBuilding3x3);

    isBuildingTypeComponent.set(DebugIronMineID);
    isBuildingTypeComponent.set(DebugCopperMineID);
    isBuildingTypeComponent.set(DebugIronMineWithBuildLimitID);
    isBuildingTypeComponent.set(DebugIronMineNoTileReqID);
    isBuildingTypeComponent.set(DebugIronPlateFactoryNoMineReqID);
    isBuildingTypeComponent.set(DebugIronPlateFactoryID);
    isBuildingTypeComponent.set(DebugSuperIronMineID);
    isBuildingTypeComponent.set(DebugSuperIronPlateFactoryID);
    isBuildingTypeComponent.set(DebugSimpleTechnologyNoReqsID);
    isBuildingTypeComponent.set(DebugSimpleTechnologyResourceReqsID);
    isBuildingTypeComponent.set(DebugSimpleTechnologyResearchReqsID);
    isBuildingTypeComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    isBuildingTypeComponent.set(DebugStorageBuildingID);

    isBuildingTypeComponent.set(DebugUtilityProductionBuilding);
    isBuildingTypeComponent.set(DebugSimpleBuildingUtilityResourceRequirement);
    isBuildingTypeComponent.set(DebugLithiumMineID);
    isBuildingTypeComponent.set(DebugAlloyFactoryID);
    isBuildingTypeComponent.set(DebugLithiumCopperOxideFactoryID);
    isBuildingTypeComponent.set(DebugSolarPanelID);

    isBuildingTypeComponent.set(DebugUnitProductionBuilding);
    isBuildingTypeComponent.set(DebugHousingBuilding);
    isBuildingTypeComponent.set(DebugSimpleBuildingMainBaseLevelReqID);
    isBuildingTypeComponent.set(DebugSimpleBuildingRequiresTitanium);
  }

  function registerUnitType(IWorld world) internal {
    P_IsUnitComponent isUnitComponent = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID));
    isUnitComponent.set(DebugUnit);
    isUnitComponent.set(DebugUnit2);
    isUnitComponent.set(DebugUnit3);

    isUnitComponent.set(DebugUnitMiner);
    isUnitComponent.set(DebugUnitMiner2);

    isUnitComponent.set(DebugUnitBattle1);
    isUnitComponent.set(DebugUnitBattle2);
  }

  function initBlueprints(IWorld world) internal {
    P_BlueprintComponent blueprintComponent = P_BlueprintComponent(world.getComponent(P_BlueprintComponentID));
    int32[] memory coords = LibBlueprint.get1x1Blueprint();
    blueprintComponent.set(DebugSimpleBuildingNoReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingResourceReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingResearchReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingBuildLimitReq, coords);
    blueprintComponent.set(DebugSimpleBuildingTileReqID, coords);
    blueprintComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID, coords);
    blueprintComponent.set(DebugSimpleBuildingWithUpgradeResearchReqsID, coords);
    blueprintComponent.set(DebugSimpleBuilding3x3, LibBlueprint.get3x3Blueprint());

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

    blueprintComponent.set(DebugUtilityProductionBuilding, coords);
    blueprintComponent.set(DebugSimpleBuildingUtilityResourceRequirement, coords);
    blueprintComponent.set(DebugLithiumMineID, coords);
    blueprintComponent.set(DebugAlloyFactoryID, coords);
    blueprintComponent.set(DebugLithiumCopperOxideFactoryID, coords);
    blueprintComponent.set(DebugSolarPanelID, coords);

    blueprintComponent.set(DebugUnitProductionBuilding, coords);
    blueprintComponent.set(DebugHousingBuilding, coords);
    blueprintComponent.set(DebugSimpleBuildingMainBaseLevelReqID, coords);

    blueprintComponent.set(DebugSimpleBuildingRequiresTitanium, coords);
  }

  function initializeSimpleBuildings(IWorld world) internal {
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      world.getComponent(P_RequiredResearchComponentID)
    );

    P_RequiredTileComponent requiredTileComponent = P_RequiredTileComponent(
      world.getComponent(P_RequiredTileComponentID)
    );
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));

    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    // DebugSimpleBuildingNoReqsID

    // DebugSimpleBuildingResourceReqsID
    uint256 entity = LibEncode.hashKeyEntity(DebugSimpleBuildingResourceReqsID, 1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    // DebugSimpleBuildingResearchReqsID
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingResearchReqsID, 1);
    requiredResearchComponent.set(entity, DebugSimpleTechnologyNoReqsID);

    // DebugSimpleBuildingTileReqID
    requiredTileComponent.set(DebugSimpleBuildingTileReqID, IronID);

    //DebugSimpleBuildingWithUpgradeResourceReqsID
    maxLevelComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID, 4);
    //DebugSimpleBuildingWithUpgradeResourceReqsID level 2
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResourceReqsID, 2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 3
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResourceReqsID, 3);
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 4
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResourceReqsID, 4);
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 100 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 4
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResourceReqsID, 4);
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    resourceValues[1] = ResourceValue({ resource: CopperResourceItemID, value: 100 });
    resourceValues[2] = ResourceValue({ resource: LithiumResourceItemID, value: 100 });
    resourceValues[3] = ResourceValue({ resource: OsmiumResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    //DebugSimpleBuildingWithUpgradeResearchReqsID
    maxLevelComponent.set(DebugSimpleBuildingWithUpgradeResearchReqsID, 2);
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(DebugSimpleBuildingWithUpgradeResearchReqsID, 2);
    requiredResearchComponent.set(buildingIdLevel, DebugSimpleTechnologyNoReqsID);

    //DebugSimpleBuildingUtilityResourceRequirement
    // LEVEL 1
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingUtilityResourceRequirement, 1);
    ResourceValues memory requiredUtilityData = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtilityData.resources[0] = ElectricityUtilityResourceID;
    requiredUtilityData.values[0] = 2;
    requiredUtilityComponent.set(entity, requiredUtilityData);

    //DebugSimpleBuilding3x3

    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    //DebugSimpleBuildingWithUpgradeResourceReqsID
    maxLevelComponent.set(DebugSimpleBuildingMainBaseLevelReqID, 2);
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingMainBaseLevelReqID, 1);
    levelComponent.set(entity, 2);

    //DebugSimpleBuildingWithUpgradeResourceReqsID level 2
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingMainBaseLevelReqID, 2);
    levelComponent.set(entity, 3);

    //DebugSimpleBuildingRequiresTitanium
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingRequiresTitanium, 1);
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);
  }

  function initializeMines(IWorld world) internal {
    P_RequiredTileComponent requiredTileComponent = P_RequiredTileComponent(
      world.getComponent(P_RequiredTileComponentID)
    );

    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(
      world.getComponent(P_ProductionComponentID)
    );
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));

    // DebugIronMineID
    requiredTileComponent.set(DebugIronMineID, IronID);
    maxLevelComponent.set(DebugIronMineID, 3);

    uint256 entity = LibEncode.hashKeyEntity(DebugIronMineID, 1);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 1 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 2 }));
    entity = LibEncode.hashKeyEntity(DebugIronMineID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 3 }));
    // DebugIronMineNoTileReqID
    maxLevelComponent.set(DebugIronMineNoTileReqID, 3);
    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 1);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 7 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 10 }));

    //DebugIronMineWithBuildLimitID
    maxLevelComponent.set(DebugIronMineWithBuildLimitID, 3);
    requiredTileComponent.set(DebugIronMineWithBuildLimitID, IronID);

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 1);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 7 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 10 }));

    //DebugCopperMineID
    maxLevelComponent.set(DebugCopperMineID, 3);
    requiredTileComponent.set(DebugCopperMineID, CopperID);

    ResourceValue[] memory resourceValues = new ResourceValue[](1);

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 3 }));

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 7 }));

    maxLevelComponent.set(DebugLithiumMineID, 3);
    requiredTileComponent.set(DebugLithiumMineID, LithiumID);

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 3 }));

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 7 }));
  }

  function initializeFactories(IWorld world) internal {
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));
    P_ProductionDependenciesComponent requiredConnectedProductionComponent = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    );
    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(
      world.getComponent(P_ProductionComponentID)
    );

    P_UtilityProductionComponent UtilityProductionComponent = P_UtilityProductionComponent(
      world.getComponent(P_UtilityProductionComponentID)
    );

    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    //DebugIronPlateFactoryNoMineReqID
    uint256 entity = DebugIronPlateFactoryNoMineReqID;

    //set a storage amount for IronPlateCraftedItemID to stream line usage
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 1);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    //DebugIronPlateFactoryID

    maxLevelComponent.set(DebugIronPlateFactoryID, 3);
    //DebugIronPlateFactoryID level 1
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1);
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: ElectricityUtilityResourceID, value: 1 });

    ResourceValues memory requiredConnectedProductions = ResourceValues(new uint256[](1), new uint32[](1));
    requiredConnectedProductions.resources[0] = IronResourceItemID;
    requiredConnectedProductions.values[0] = 1;
    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 2 }));

    //DebugIronPlateFactoryID level 2
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 2);
    requiredConnectedProductions.resources[0] = IronResourceItemID;
    requiredConnectedProductions.values[0] = 2;
    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 4 }));

    //DebugIronPlateFactoryID level 3
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 3);
    requiredConnectedProductions.resources[0] = IronResourceItemID;
    requiredConnectedProductions.values[0] = 2;
    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 6 }));

    //DebugUtilityProductionBuilding level 1
    entity = LibEncode.hashKeyEntity(DebugUtilityProductionBuilding, 1);
    maxLevelComponent.set(DebugUtilityProductionBuilding, 2);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 10));
    //level 2
    entity = LibEncode.hashKeyEntity(DebugUtilityProductionBuilding, 2);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 20));

    //DebugAlloyFactoryID

    //DebugAlloyFactoryID level 1
    entity = LibEncode.hashKeyEntity(DebugAlloyFactoryID, 1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    requiredConnectedProductions = ResourceValues(new uint256[](2), new uint32[](2));
    requiredConnectedProductions.resources[0] = IronResourceItemID;
    requiredConnectedProductions.values[0] = 1;
    requiredConnectedProductions.resources[0] = CopperResourceItemID;
    requiredConnectedProductions.values[0] = 1;

    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    requiredConnectedProductions = ResourceValues(new uint256[](1), new uint32[](1));
    requiredConnectedProductions.resources[0] = ElectricityUtilityResourceID;
    requiredConnectedProductions.values[0] = 1;
    requiredUtilityComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: AlloyCraftedItemID, value: 1 }));

    //DebugLithiumCopperOxideFactoryID

    //Level 1
    entity = LibEncode.hashKeyEntity(DebugLithiumCopperOxideFactoryID, 1);
    resourceValues[0] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });

    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    requiredConnectedProductions = ResourceValues(new uint256[](2), new uint32[](2));
    requiredConnectedProductions.resources[0] = LithiumResourceItemID;
    requiredConnectedProductions.values[0] = 1;
    requiredConnectedProductions.resources[0] = CopperResourceItemID;
    requiredConnectedProductions.values[0] = 1;

    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 2 }));
  }

  function initializeTechnologies(IWorld world) internal {
    P_IsTechComponent isTechComponent = P_IsTechComponent(world.getComponent(P_IsTechComponentID));
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      world.getComponent(P_RequiredResearchComponentID)
    );
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    // DebugSimpleTechnologyNoReqsID
    isTechComponent.set(DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);
    isTechComponent.set(DebugSimpleTechnologyResearchReqsID);
    //DebugSimpleTechnologyResourceReqsID
    isTechComponent.set(DebugSimpleTechnologyResourceReqsID);
    /****************** Required Resources *******************/

    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyResourceReqsID, resourceValues);

    //DebugSimpleTechnologyMainBaseLevelReqsID
    isTechComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    levelComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);

    P_UnitLevelUpgradeComponent unitLevelUpgradeComponent = P_UnitLevelUpgradeComponent(
      world.getComponent(P_UnitLevelUpgradeComponentID)
    );

    //DebugSimpleTechnologyUpgradeUnit
    isTechComponent.set(DebugSimpleTechnologyUpgradeUnit);
    unitLevelUpgradeComponent.set(DebugSimpleTechnologyUpgradeUnit, ResourceValue({ resource: DebugUnit, value: 1 }));

    P_UtilityProductionComponent utilityProductionComponent = P_UtilityProductionComponent(
      world.getComponent(P_UtilityProductionComponentID)
    );

    //DebugSimpleTechnologyIncreaseHousing
    isTechComponent.set(DebugSimpleTechnologyIncreaseHousing);
    utilityProductionComponent.set(DebugSimpleTechnologyIncreaseHousing, ResourceValue(HousingUtilityResourceID, 10));

    //DebugSimpleTechnologyTitaniumCostID
    isTechComponent.set(DebugSimpleTechnologyTitaniumCostID);

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyTitaniumCostID, resourceValues);

    //DebugSimpleTechnologyIridiumCostID
    isTechComponent.set(DebugSimpleTechnologyIridiumCostID);

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IridiumResourceItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyIridiumCostID, resourceValues);

    //DebugSimpleTechnologyPlatinumCostID
    isTechComponent.set(DebugSimpleTechnologyPlatinumCostID);

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyPlatinumCostID, resourceValues);

    //DebugSimpleTechnologyKimberliteCostID
    isTechComponent.set(DebugSimpleTechnologyKimberliteCostID);

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyKimberliteCostID, resourceValues);
  }

  function initializeStorageBuildings(IWorld world) internal {
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));
    //DebugStorageBuildingID
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

  function initUtilityBuildings(IWorld world) internal {
    P_UtilityProductionComponent UtilityProductionComponent = P_UtilityProductionComponent(
      world.getComponent(P_UtilityProductionComponentID)
    );

    //DebugSolarPanelID
    uint256 entity = LibEncode.hashKeyEntity(DebugSolarPanelID, 1);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 10));

    //DebugHousingBuilding
    entity = LibEncode.hashKeyEntity(DebugHousingBuilding, 1);
    UtilityProductionComponent.set(entity, ResourceValue(HousingUtilityResourceID, 20));
  }

  function initializeUnitProductionBuildings(IWorld world) internal {
    P_UnitProductionMultiplierComponent unitProductionMultiplierComponent = P_UnitProductionMultiplierComponent(
      world.getComponent(P_UnitProductionMultiplierComponentID)
    );

    P_UnitProductionTypesComponent unitProductionTypesComponent = P_UnitProductionTypesComponent(
      world.getComponent(P_UnitProductionTypesComponentID)
    );
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));

    // MainBase
    // Level 1
    uint256 entity = LibEncode.hashKeyEntity(MainBaseID, 1);
    uint256[] memory unitTypes = new uint256[](2);

    unitTypes[0] = DebugUnit;
    unitTypes[1] = DebugUnit3;
    unitProductionTypesComponent.set(entity, unitTypes);
    unitProductionMultiplierComponent.set(entity, 100);

    //DebugUnitProductionBuilding
    maxLevelComponent.set(DebugUnitProductionBuilding, 2);
    // Level 1
    entity = LibEncode.hashKeyEntity(DebugUnitProductionBuilding, 1);

    unitTypes = new uint256[](2);
    unitTypes[0] = DebugUnit;
    unitTypes[1] = DebugUnit3;
    unitProductionTypesComponent.set(entity, unitTypes);
    unitProductionMultiplierComponent.set(entity, 100);
    // Level 2
    entity = LibEncode.hashKeyEntity(DebugUnitProductionBuilding, 2);
    unitTypes = new uint256[](2);
    unitTypes[0] = DebugUnit;
    unitTypes[1] = DebugUnit2;
    unitProductionTypesComponent.set(entity, unitTypes);
    unitProductionMultiplierComponent.set(entity, 200);
  }

  function initializeUnits(IWorld world) internal {
    P_UnitAttackComponent unitAttackComponent = P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID));
    P_UnitDefenceComponent unitDefenceComponent = P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID));

    P_UnitTrainingTimeComponent unitTrainingTimeComponent = P_UnitTrainingTimeComponent(
      world.getComponent(P_UnitTrainingTimeComponentID)
    );
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    SpeedComponent speedComponent = SpeedComponent(world.getComponent(SpeedComponentID));
    P_UnitCargoComponent unitCargoComponent = P_UnitCargoComponent(world.getComponent(P_UnitCargoComponentID));
    P_UnitMiningComponent unitMiningComponent = P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID));

    //DebugUnit
    // Level 1
    uint256 entity = LibEncode.hashKeyEntity(DebugUnit, 0);
    unitTrainingTimeComponent.set(entity, 2);

    ResourceValues memory requiredUtility = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtility.resources[0] = HousingUtilityResourceID;
    requiredUtility.values[0] = 1;
    requiredUtilityComponent.set(entity, requiredUtility);

    speedComponent.set(entity, 100);
    unitAttackComponent.set(entity, 5);
    unitDefenceComponent.set(entity, 3);
    unitCargoComponent.set(entity, 10);
    unitMiningComponent.set(entity, 1);

    //DebugUnit2
    // Level 1
    entity = LibEncode.hashKeyEntity(DebugUnit2, 0);
    unitTrainingTimeComponent.set(entity, 4);

    requiredUtility = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtility.resources[0] = HousingUtilityResourceID;
    requiredUtility.values[0] = 1;
    requiredUtilityComponent.set(entity, requiredUtility);

    speedComponent.set(entity, 200);
    unitAttackComponent.set(entity, 20);
    unitDefenceComponent.set(entity, 10);
    unitCargoComponent.set(entity, 20);
    unitMiningComponent.set(entity, 1);

    //DebugUnit3
    // Level 1
    entity = LibEncode.hashKeyEntity(DebugUnit3, 0);
    unitTrainingTimeComponent.set(entity, 4);
    requiredUtility = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtility.resources[0] = HousingUtilityResourceID;
    requiredUtility.values[0] = 1;
    requiredUtilityComponent.set(entity, requiredUtility);

    speedComponent.set(entity, 50);
    unitAttackComponent.set(entity, 20);
    unitDefenceComponent.set(entity, 10);
    unitCargoComponent.set(entity, 20);
    unitMiningComponent.set(entity, 100);

    // DebugUnit3
    // Level 2
    entity = LibEncode.hashKeyEntity(DebugUnit3, 0);

    unitTrainingTimeComponent.set(entity, 4);
    requiredUtility = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtility.resources[0] = HousingUtilityResourceID;
    requiredUtility.values[0] = 1;
    requiredUtilityComponent.set(entity, requiredUtility);

    speedComponent.set(entity, 50);
    unitAttackComponent.set(entity, 20);
    unitDefenceComponent.set(entity, 10);
    unitCargoComponent.set(entity, 20);
    unitMiningComponent.set(entity, 100);

    //DebugUnitBattle1
    // Level 1
    entity = LibEncode.hashKeyEntity(DebugUnitBattle1, 0);
    unitTrainingTimeComponent.set(entity, 10);

    unitAttackComponent.set(entity, 10);
    unitDefenceComponent.set(entity, 5);
    unitCargoComponent.set(entity, 100);

    //DebugUnitBattle2
    // Level 1
    entity = LibEncode.hashKeyEntity(DebugUnitBattle2, 0);
    unitTrainingTimeComponent.set(entity, 10);

    unitAttackComponent.set(entity, 5);
    unitDefenceComponent.set(entity, 10);
    unitCargoComponent.set(entity, 100);

    entity = LibEncode.hashKeyEntity(DebugUnitMiner, 0);
    unitMiningComponent.set(entity, 100);

    entity = LibEncode.hashKeyEntity(DebugUnitMiner2, 0);
    unitMiningComponent.set(entity, 47);
  }
}
