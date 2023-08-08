// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// Production Buildings
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_IgnoreBuildLimitComponent, ID as P_IgnoreBuildLimitComponentID } from "components/P_IgnoreBuildLimitComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_BlueprintComponent as P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

import "../prototypes.sol";
import { ResourceValue, ResourceValues } from "../types.sol";
import { DEBUG } from "../constants.sol";

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
    initializeSimpleBuildings(world);

    initializeMines(world);

    initializeFactories(world);

    initializeTechnologies(world);

    initializeStorageBuildings(world);
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
  }

  function initializeSimpleBuildings(IWorld world) internal {
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      world.getComponent(P_RequiredResearchComponentID)
    );
    P_IgnoreBuildLimitComponent ignoreBuildLimitComponent = P_IgnoreBuildLimitComponent(
      world.getComponent(P_IgnoreBuildLimitComponentID)
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
    ignoreBuildLimitComponent.set(DebugSimpleBuildingNoReqsID);

    // DebugSimpleBuildingResourceReqsID
    uint256 entity = LibEncode.hashKeyEntity(DebugSimpleBuildingResourceReqsID, 1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 100 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    // DebugSimpleBuildingResearchReqsID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingResourceReqsID);
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingResearchReqsID, 1);
    requiredResearchComponent.set(entity, DebugSimpleTechnologyNoReqsID);

    // DebugSimpleBuildingTileReqID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingTileReqID);
    requiredTileComponent.set(DebugSimpleBuildingTileReqID, IronID);

    //DebugSimpleBuildingWithUpgradeResourceReqsID
    ignoreBuildLimitComponent.set(DebugSimpleBuildingWithUpgradeResourceReqsID);
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
    ignoreBuildLimitComponent.set(DebugSimpleBuildingUtilityResourceRequirement);
    // LEVEL 1
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingUtilityResourceRequirement, 1);
    ResourceValues memory requiredUtilityData = ResourceValues(new uint256[](1), new uint32[](1));
    requiredUtilityData.resources[0] = ElectricityUtilityResourceID;
    requiredUtilityData.values[0] = 2;
    requiredUtilityComponent.set(entity, requiredUtilityData);

    //DebugSimpleBuilding3x3
    ignoreBuildLimitComponent.set(DebugSimpleBuilding3x3);
  }

  function initializeMines(IWorld world) internal {
    P_IgnoreBuildLimitComponent ignoreBuildLimitComponent = P_IgnoreBuildLimitComponent(
      world.getComponent(P_IgnoreBuildLimitComponentID)
    );
    P_RequiredTileComponent requiredTileComponent = P_RequiredTileComponent(
      world.getComponent(P_RequiredTileComponentID)
    );

    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(
      world.getComponent(P_ProductionComponentID)
    );
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));

    // DebugIronMineID
    ignoreBuildLimitComponent.set(DebugIronMineID);
    requiredTileComponent.set(DebugIronMineID, IronID);
    maxLevelComponent.set(DebugIronMineID, 3);

    uint256 entity = LibEncode.hashKeyEntity(DebugIronMineID, 1);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 1 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineID, 2);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 2 }));
    entity = LibEncode.hashKeyEntity(DebugIronMineID, 3);
    buildingProductionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 3 }));
    // DebugIronMineNoTileReqID
    ignoreBuildLimitComponent.set(DebugIronMineNoTileReqID);
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
    ignoreBuildLimitComponent.set(DebugCopperMineID);

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
    ignoreBuildLimitComponent.set(DebugLithiumMineID);

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
    P_IgnoreBuildLimitComponent ignoreBuildLimitComponent = P_IgnoreBuildLimitComponent(
      world.getComponent(P_IgnoreBuildLimitComponentID)
    );

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
    ignoreBuildLimitComponent.set(entity);

    //set a storage amount for IronPlateCraftedItemID to stream line usage
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 1);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    //DebugIronPlateFactoryID

    ignoreBuildLimitComponent.set(DebugIronPlateFactoryID);
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
    requiredConnectedProductions.values[0] = 1;
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
    ignoreBuildLimitComponent.set(DebugUtilityProductionBuilding);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 10));
    //level 2
    entity = LibEncode.hashKeyEntity(DebugUtilityProductionBuilding, 2);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 20));

    //DebugAlloyFactoryID
    ignoreBuildLimitComponent.set(DebugAlloyFactoryID);

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

    //LithiumCopperOxideFactoryID

    ignoreBuildLimitComponent.set(LithiumCopperOxideFactoryID);
    //LithiumCopperOxideFactoryID level 1
    entity = LibEncode.hashKeyEntity(LithiumCopperOxideFactoryID, 1);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    requiredConnectedProductions = ResourceValues(new uint256[](2), new uint32[](2));
    requiredConnectedProductions.resources[0] = LithiumResourceItemID;
    requiredConnectedProductions.values[0] = 1;
    requiredConnectedProductions.resources[0] = CopperResourceItemID;
    requiredConnectedProductions.values[0] = 1;

    requiredConnectedProductionComponent.set(entity, requiredConnectedProductions);

    buildingProductionComponent.set(entity, ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2 }));

    //DebugSolarPanelID
    ignoreBuildLimitComponent.set(DebugSolarPanelID);
    entity = LibEncode.hashKeyEntity(DebugSolarPanelID, 1);
    UtilityProductionComponent.set(entity, ResourceValue(ElectricityUtilityResourceID, 10));
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
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyResourceReqsID, resourceValues);

    //DebugSimpleTechnologyMainBaseLevelReqsID
    isTechComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
    levelComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID, 2);
  }

  function initializeStorageBuildings(IWorld world) internal {
    P_IgnoreBuildLimitComponent ignoreBuildLimitComponent = P_IgnoreBuildLimitComponent(
      world.getComponent(P_IgnoreBuildLimitComponentID)
    );
    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID));
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
