// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";
// Production Buildings
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { IsActiveTechnologyComponent, ID as IsActiveTechnologyComponentID } from "components/IsActiveTechnologyComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "components/MinesComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BlueprintComponent as BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";
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
    BlueprintComponent blueprintComponent = BlueprintComponent(world.getComponent(BlueprintComponentID));
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

    blueprintComponent.set(DebugPassiveProductionBuilding, coords);
    blueprintComponent.set(DebugSimpleBuildingPassiveResourceRequirement, coords);
    blueprintComponent.set(DebugLithiumMineID, coords);
    blueprintComponent.set(DebugAlloyFactoryID, coords);
    blueprintComponent.set(DebugLithiumCopperOxideFactoryID, coords);
    blueprintComponent.set(DebugSolarPanelID, coords);
  }

  function initializeSimpleBuildings(IWorld world) internal {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      world.getComponent(RequiredResearchComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      world.getComponent(IgnoreBuildLimitComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(world.getComponent(MaxLevelComponentID));

    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      world.getComponent(RequiredPassiveComponentID)
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
    buildingTypeComponent.set(DebugSimpleBuildingTileReqID, IronID);

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

    //DebugSimpleBuildingPassiveResourceRequirement
    ignoreBuildLimitComponent.set(DebugSimpleBuildingPassiveResourceRequirement);
    // LEVEL 1
    entity = LibEncode.hashKeyEntity(DebugSimpleBuildingPassiveResourceRequirement, 1);
    ResourceValues memory requiredPassiveData = ResourceValues(new uint256[](1), new uint32[](1));
    requiredPassiveData.resources[0] = ElectricityPassiveResourceID;
    requiredPassiveData.values[0] = 2;
    requiredPassiveComponent.set(entity, requiredPassiveData);

    //DebugSimpleBuilding3x3
    ignoreBuildLimitComponent.set(DebugSimpleBuilding3x3);
  }

  function initializeMines(IWorld world) internal {
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      world.getComponent(IgnoreBuildLimitComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID));

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(world.getComponent(MaxLevelComponentID));

    // DebugIronMineID
    ignoreBuildLimitComponent.set(DebugIronMineID);
    buildingTypeComponent.set(DebugIronMineID, IronID);
    maxLevelComponent.set(DebugIronMineID, 3);

    uint256 entity = LibEncode.hashKeyEntity(DebugIronMineID, 1);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 1 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineID, 2);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 2 }));
    entity = LibEncode.hashKeyEntity(DebugIronMineID, 3);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 3 }));
    // DebugIronMineNoTileReqID
    ignoreBuildLimitComponent.set(DebugIronMineNoTileReqID);
    maxLevelComponent.set(DebugIronMineNoTileReqID, 3);
    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 1);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 2);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 7 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineNoTileReqID, 3);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 10 }));

    //DebugIronMineWithBuildLimitID
    maxLevelComponent.set(DebugIronMineWithBuildLimitID, 3);
    buildingTypeComponent.set(DebugIronMineWithBuildLimitID, IronID);

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 1);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 2);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 7 }));

    entity = LibEncode.hashKeyEntity(DebugIronMineWithBuildLimitID, 3);
    productionComponent.set(entity, ResourceValue({ resource: IronResourceItemID, value: 10 }));

    //DebugCopperMineID
    maxLevelComponent.set(DebugCopperMineID, 3);
    buildingTypeComponent.set(DebugCopperMineID, CopperID);
    ignoreBuildLimitComponent.set(DebugCopperMineID);

    ResourceValue[] memory resourceValues = new ResourceValue[](1);

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 3 }));

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 2);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugCopperMineID, 3);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 7 }));

    maxLevelComponent.set(DebugLithiumMineID, 3);
    buildingTypeComponent.set(DebugLithiumMineID, LithiumID);
    ignoreBuildLimitComponent.set(DebugLithiumMineID);

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 1);
    resourceValues[0] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 3 }));

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 2);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 5 }));

    entity = LibEncode.hashKeyEntity(DebugLithiumMineID, 3);
    productionComponent.set(entity, ResourceValue({ resource: CopperResourceItemID, value: 7 }));
  }

  function initializeFactories(IWorld world) internal {
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      world.getComponent(IgnoreBuildLimitComponentID)
    );

    MaxLevelComponent maxLevelComponent = MaxLevelComponent(world.getComponent(MaxLevelComponentID));
    MinesComponent minesComponent = MinesComponent(world.getComponent(MinesComponentID));
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));

    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      world.getComponent(PassiveProductionComponentID)
    );
    //DebugIronPlateFactoryNoMineReqID
    uint256 entity = DebugIronPlateFactoryNoMineReqID;
    maxLevelComponent.set(entity, 3);
    ignoreBuildLimitComponent.set(entity);

    //set a storage amount for IronPlateCraftedItemID to stream line usage
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 1);
    ResourceValue[] memory resourceValues = new ResourceValue[](1);

    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 2);

    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryNoMineReqID, 3);

    //DebugIronPlateFactoryID

    ignoreBuildLimitComponent.set(DebugIronPlateFactoryID);
    maxLevelComponent.set(DebugIronPlateFactoryID, 3);
    //DebugIronPlateFactoryID level 1
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1);
    resourceValues = new ResourceValue[](1);

    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    ResourceValues memory requiredMines = ResourceValues(new uint256[](1), new uint32[](1));
    requiredMines.resources[0] = DebugIronMineID;
    requiredMines.values[0] = 1;
    minesComponent.set(entity, requiredMines);

    productionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 2 }));

    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setStorageUpgrades(world, entity, resourceValues);

    //DebugIronPlateFactoryID level 2
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 2);
    requiredMines.resources[0] = DebugIronMineID;
    requiredMines.values[0] = 1;
    minesComponent.set(entity, requiredMines);

    productionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 4 }));

    //DebugIronPlateFactoryID level 3
    entity = LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 3);
    requiredMines.resources[0] = DebugIronMineID;
    requiredMines.values[0] = 2;
    minesComponent.set(entity, requiredMines);

    productionComponent.set(entity, ResourceValue({ resource: IronPlateCraftedItemID, value: 6 }));

    //DebugPassiveProductionBuilding level 1
    entity = LibEncode.hashKeyEntity(DebugPassiveProductionBuilding, 1);
    maxLevelComponent.set(DebugPassiveProductionBuilding, 2);
    ignoreBuildLimitComponent.set(DebugPassiveProductionBuilding);
    passiveProductionComponent.set(entity, ResourceValue(ElectricityPassiveResourceID, 10));
    //level 2
    entity = LibEncode.hashKeyEntity(DebugPassiveProductionBuilding, 2);
    passiveProductionComponent.set(entity, ResourceValue(ElectricityPassiveResourceID, 20));

    //DebugAlloyFactoryID
    ignoreBuildLimitComponent.set(DebugAlloyFactoryID);

    //DebugAlloyFactoryID level 1
    entity = LibEncode.hashKeyEntity(DebugAlloyFactoryID, 1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    requiredMines = ResourceValues(new uint256[](2), new uint32[](2));
    requiredMines.resources[0] = DebugIronMineID;
    requiredMines.values[0] = 1;
    requiredMines.resources[0] = DebugCopperMineID;
    requiredMines.values[0] = 1;

    minesComponent.set(entity, requiredMines);

    productionComponent.set(entity, ResourceValue({ resource: AlloyCraftedItemID, value: 1 }));

    //LithiumCopperOxideFactoryID

    ignoreBuildLimitComponent.set(LithiumCopperOxideFactoryID);
    //LithiumCopperOxideFactoryID level 1
    entity = LibEncode.hashKeyEntity(LithiumCopperOxideFactoryID, 1);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, entity, resourceValues);

    requiredMines = ResourceValues(new uint256[](2), new uint32[](2));
    requiredMines.resources[0] = DebugLithiumMineID;
    requiredMines.values[0] = 1;
    requiredMines.resources[0] = DebugCopperMineID;
    requiredMines.values[0] = 1;

    minesComponent.set(entity, requiredMines);

    productionComponent.set(entity, ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 2 }));

    //DebugSolarPanelID
    ignoreBuildLimitComponent.set(DebugSolarPanelID);
    entity = LibEncode.hashKeyEntity(DebugSolarPanelID, 1);
    passiveProductionComponent.set(entity, ResourceValue(ElectricityPassiveResourceID, 10));
  }

  function initializeTechnologies(IWorld world) internal {
    IsActiveTechnologyComponent isActiveTechnologyComponent = IsActiveTechnologyComponent(
      world.getComponent(IsActiveTechnologyComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      world.getComponent(RequiredResearchComponentID)
    );
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    // DebugSimpleTechnologyNoReqsID
    isActiveTechnologyComponent.set(DebugSimpleTechnologyNoReqsID);

    //DebugSimpleTechnologyResearchReqsID
    requiredResearchComponent.set(DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyNoReqsID);
    isActiveTechnologyComponent.set(DebugSimpleTechnologyResearchReqsID);
    //DebugSimpleTechnologyResourceReqsID
    isActiveTechnologyComponent.set(DebugSimpleTechnologyResourceReqsID);
    /****************** Required Resources *******************/

    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: LithiumCopperOxideCraftedItemID, value: 500 });

    LibSetBuildingReqs.setResourceReqs(world, DebugSimpleTechnologyResourceReqsID, resourceValues);

    //DebugSimpleTechnologyMainBaseLevelReqsID
    isActiveTechnologyComponent.set(DebugSimpleTechnologyMainBaseLevelReqsID);
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
