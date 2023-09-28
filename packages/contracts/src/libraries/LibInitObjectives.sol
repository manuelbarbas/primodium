// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { P_DestroyedUnitsRequirementComponent, ID as P_DestroyedUnitsRequirementComponentID } from "components/P_DestroyedUnitsRequirementComponent.sol";
import { P_RaidRequirementComponent, ID as P_RaidRequirementComponentID } from "components/P_RaidRequirementComponent.sol";
import { P_MotherlodeMinedRequirementComponent, ID as P_MotherlodeMinedRequirementComponentID } from "components/P_MotherlodeMinedRequirementComponent.sol";
import { P_IsObjectiveComponent, ID as P_IsObjectiveComponentID } from "components/P_IsObjectiveComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredPirateAsteroidDefeatedComponent, ID as P_RequiredPirateAsteroidDefeatedComponentID } from "components/P_RequiredPirateAsteroidDefeatedComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitRequirementComponent, ID as P_UnitRequirementComponentID } from "components/P_UnitRequirementComponent.sol";
import { P_SpawnPirateAsteroidComponent, ID as P_SpawnPirateAsteroidComponentID } from "components/P_SpawnPirateAsteroidComponent.sol";
import { P_UnitRewardComponent, ID as P_UnitRewardComponentID } from "components/P_UnitRewardComponent.sol";
import { P_ObjectiveRequirementComponent, ID as P_ObjectiveRequirementComponentID } from "components/P_ObjectiveRequirementComponent.sol";
import { P_ResourceRewardComponent, ID as P_ResourceRewardComponentID } from "components/P_ResourceRewardComponent.sol";
import { P_HasBuiltBuildingComponent, ID as P_HasBuiltBuildingComponentID } from "components/P_HasBuiltBuildingComponent.sol";

import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items

import { ResourceValue, ResourceValues, Dimensions } from "../types.sol";

// Research
import "../prototypes.sol";
import "../prototypes/Objectives.sol";
import "../prototypes/PirateAsteroids.sol";

library LibInitObjectives {
  function init(IWorld world) internal {
    initPirateAsteroidObjectives(world);
    initBuildingObjectives(world);
    initExpandBaseObjective(world);
    initMotherlodeMiningObjectives(world);
    initUnitTrainingObjectives(world);
    initRaidObjectives(world);
    initTechnologyObjevctives(world);
    initDestroyUnitsObjective(world);

    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //UpgradeMainBaseID
    objective = UpgradeMainBaseID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 2);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 300000;
    P_ResourceRewardComponent(world.getComponent(P_ProductionDependenciesComponentID)).set(objective, resourceRewards);
  }

  function initPirateAsteroidObjectives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    //DefeatFirstPirateBaseID
    objective = DefeatFirstPirateBaseID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildWorkshopID
    );
    P_RequiredPirateAsteroidDefeatedComponent(world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)).set(
      objective,
      FirstPirateAsteroidID
    );
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      SecondPirateAsteroidID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 100000;
    resourceRewards.resources[1] = IronResourceItemID;
    resourceRewards.values[1] = 100000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //DefeatSecondPirateBaseID
    objective = DefeatSecondPirateBaseID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DefeatFirstPirateBaseID
    );
    P_RequiredPirateAsteroidDefeatedComponent(world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)).set(
      objective,
      SecondPirateAsteroidID
    );
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      ThirdPirateAsteroidID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 50;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //DefeatThirdPirateBaseID
    objective = DefeatThirdPirateBaseID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DefeatSecondPirateBaseID
    );
    P_RequiredPirateAsteroidDefeatedComponent(world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)).set(
      objective,
      ThirdPirateAsteroidID
    );
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      FourthPirateAsteroidID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //DefeatFourthPirateBaseID
    objective = DefeatFourthPirateBaseID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DefeatThirdPirateBaseID
    );
    P_RequiredPirateAsteroidDefeatedComponent(world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)).set(
      objective,
      FourthPirateAsteroidID
    );
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      FifthPirateAsteroidID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //DefeatFifthPirateBaseID
    objective = DefeatFifthPirateBaseID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DefeatFourthPirateBaseID
    );
    P_RequiredPirateAsteroidDefeatedComponent(world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)).set(
      objective,
      FourthPirateAsteroidID
    );
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      FifthPirateAsteroidID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 70;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);
  }

  function initBuildingObjectives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //BuildFirstIronMineID
    objective = BuildFirstIronMineID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, IronMineID);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 20000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildFirstCopperMineID
    objective = BuildFirstCopperMineID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, CopperMineID);

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 20000;
    resourceRewards.resources[1] = IronResourceItemID;
    resourceRewards.values[1] = 20000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildFirstIronPlateFactoryID
    objective = BuildFirstIronPlateFactoryID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, IronPlateFactoryID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildFirstIronMineID
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildGarageID
    objective = BuildGarageID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, GarageID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildFirstIronMineID
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 10;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //BuildWorkshopID
    objective = BuildWorkshopID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, WorkshopID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildGarageID
    );

    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      objective,
      FirstPirateAsteroidID
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronPlateCraftedItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildFirstLithiumMineID
    objective = BuildFirstLithiumMineID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, LithiumMineID);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 2);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = LithiumResourceItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildFirstPVCellFactoryID
    objective = BuildFirstPVCellFactoryID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(
      objective,
      PhotovoltaicCellFactoryID
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildFirstLithiumMineID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 20000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildSolarPanelID
    objective = BuildSolarPanelID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, SolarPanelID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildFirstPVCellFactoryID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 100000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 100000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildFirstSulfurMineID
    objective = BuildFirstSulfurMineID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, SulfurMineID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildSolarPanelID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = SulfurResourceItemID;
    resourceRewards.values[0] = 50000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 100000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //BuildDroneFactoryID
    objective = BuildDroneFactoryID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, DroneFactoryID);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildSolarPanelID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //BuildStarmapID
    objective = BuildStarmapID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, StarmapperID);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 3);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 10;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //BuildSAMLauncherID
    objective = BuildSAMLauncherID;
    isObjectiveComponent.set(objective);
    P_HasBuiltBuildingComponent(world.getComponent(P_HasBuiltBuildingComponentID)).set(objective, SAMMissilesID);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 5);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 150;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);
  }

  function initTechnologyObjevctives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //DestroyEnemyUnitsID
    objective = DestroyEnemyUnitsID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 1);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 500;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 300000;
    resourceRewards.resources[1] = SulfurResourceItemID;
    resourceRewards.values[1] = 300000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);
  }

  function initExpandBaseObjective(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //ExpandBaseID
    objective = ExpandBaseID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 2);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 1)
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 200000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //ExpandBase2ID
    objective = ExpandBase2ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 2);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 2)
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(objective, ExpandBaseID);
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 500000;

    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //ExpandBase3ID
    objective = ExpandBase3ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 3);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 3)
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      ExpandBase2ID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 500000;

    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //ExpandBase4ID
    objective = ExpandBase4ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 4)
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      ExpandBase3ID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 1000000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 1000000;

    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //ExpandBase5ID
    objective = ExpandBase5ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 5);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 5)
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      ExpandBase4ID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 2000000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 2000000;

    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //ExpandBase6ID
    objective = ExpandBase6ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 6);
    P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).set(
      objective,
      LibEncode.hashKeyEntity(ExpansionKey, 6)
    );
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      ExpandBase5ID
    );
    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 10000000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 10000000;

    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);
  }

  function initUnitTrainingObjectives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    //CommissionMiningVesselID
    objective = CommissionMiningVesselID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MiningVessel;
    resourceRewards.values[0] = 1;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AlloyCraftedItemID;
    resourceRewards.values[0] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainMinutemanMarineID
    objective = TrainMinutemanMarineID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildWorkshopID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IronPlateCraftedItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainMinutemanMarine2ID
    objective = TrainMinutemanMarine2ID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainMinutemanMarineID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = SulfurResourceItemID;
    resourceRewards.values[0] = 100000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainMinutemanMarine3ID
    objective = TrainMinutemanMarine2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainMinutemanMarine2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 200;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = SulfurResourceItemID;
    resourceRewards.values[0] = 300000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainTridentMarineID
    objective = TrainTridentMarineID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildWorkshopID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TridentMarine;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = LithiumResourceItemID;
    resourceRewards.values[0] = 100000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainTridentMarine2ID
    objective = TrainTridentMarine2ID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainTridentMarineID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TridentMarine;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = LithiumResourceItemID;
    resourceRewards.values[0] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainTridentMarine3ID
    objective = TrainTridentMarine2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainTridentMarine2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TridentMarine;
    resourceRewards.values[0] = 200;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = SulfurResourceItemID;
    resourceRewards.values[0] = 1000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAnvilDroneID
    objective = TrainAnvilDroneID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildDroneFactoryID
    );
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 2);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 20;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAnvilDrone2ID
    objective = TrainAnvilDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainAnvilDroneID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 200000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAnvilDrone3ID
    objective = TrainAnvilDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainAnvilDrone2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainHammerDroneID
    objective = TrainHammerDroneID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildDroneFactoryID
    );
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 3);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 20;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainHammerDrone2ID
    objective = TrainHammerDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainHammerDroneID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainHammerDrone3ID
    objective = TrainHammerDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainHammerDrone2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[0] = 1000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAegisDroneID
    objective = TrainAegisDroneID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildDroneFactoryID
    );
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 20;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AlloyCraftedItemID;
    resourceRewards.values[0] = 50000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAegisDrone2ID
    objective = TrainAegisDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainAegisDroneID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AlloyCraftedItemID;
    resourceRewards.values[0] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainAegisDrone3ID
    objective = TrainAegisDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainAegisDrone2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AlloyCraftedItemID;
    resourceRewards.values[0] = 1000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainStingerDroneID
    objective = TrainStingerDroneID;
    isObjectiveComponent.set(objective);

    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      BuildDroneFactoryID
    );
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 5);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 20;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 500000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 500000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainStingerDrone2ID
    objective = TrainStingerDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainStingerDroneID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 50;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 1500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 1500000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 1500000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 1500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //TrainStingerDrone3ID
    objective = TrainStingerDrone2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      TrainStingerDrone2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 7500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 7500000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 7500000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 7500000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);
  }

  function initMotherlodeMiningObjectives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //MineTitanium1ID
    objective = MineTitanium1ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 100000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineTitanium2ID
    objective = MineTitanium2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineTitanium1ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 300000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineTitanium3ID
    objective = MineTitanium3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineTitanium2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 1000000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 250;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MinePlatinum1ID
    objective = MinePlatinum1ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PlatinumResourceItemID;
    resourceRewards.values[0] = 100000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MinePlatinum2ID
    objective = MinePlatinum2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MinePlatinum1ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PlatinumResourceItemID;
    resourceRewards.values[0] = 300000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MinePlatinum3ID
    objective = MinePlatinum3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MinePlatinum2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = PlatinumResourceItemID;
    resourceRewards.values[0] = 1000000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 250;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineIridium1ID
    objective = MineIridium1ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IridiumResourceItemID;
    resourceRewards.values[0] = 100000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineIridium2ID
    objective = MineIridium2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineIridium1ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IridiumResourceItemID;
    resourceRewards.values[0] = 300000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineIridium3ID
    objective = MineIridium3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineIridium2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = IridiumResourceItemID;
    resourceRewards.values[0] = 1000000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 250;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineKimberlite1ID
    objective = MineKimberlite1ID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 4);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = KimberliteResourceItemID;
    resourceRewards.values[0] = 100000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 15;
    resourceRewards.resources[1] = HammerDrone;
    resourceRewards.values[1] = 15;
    resourceRewards.resources[2] = AegisDrone;
    resourceRewards.values[2] = 15;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineKimberlite2ID
    objective = MineKimberlite2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineKimberlite1ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = KimberliteResourceItemID;
    resourceRewards.values[0] = 300000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 50;
    resourceRewards.resources[1] = HammerDrone;
    resourceRewards.values[1] = 50;
    resourceRewards.resources[2] = AegisDrone;
    resourceRewards.values[2] = 50;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //MineKimberlite3ID
    objective = MineKimberlite3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      MineKimberlite2ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = KimberliteResourceItemID;
    resourceRewards.values[0] = 1000000;
    P_MotherlodeMinedRequirementComponent(world.getComponent(P_MotherlodeMinedRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 100;
    resourceRewards.resources[1] = HammerDrone;
    resourceRewards.values[1] = 100;
    resourceRewards.resources[2] = AegisDrone;
    resourceRewards.values[2] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);
  }

  function initRaidObjectives(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //RaidRawResourcesID
    objective = RaidRawResourcesID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 1);
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 200000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 200000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 200000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 200000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidRawResources2ID
    objective = RaidRawResources2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidRawResourcesID
    );
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 500000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 500000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidRawResources3ID
    objective = RaidRawResources3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidRawResources2ID
    );
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = IronResourceItemID;
    resourceRewards.values[0] = 2500000;
    resourceRewards.resources[1] = CopperResourceItemID;
    resourceRewards.values[1] = 2500000;
    resourceRewards.resources[2] = LithiumResourceItemID;
    resourceRewards.values[2] = 2500000;
    resourceRewards.resources[3] = SulfurResourceItemID;
    resourceRewards.values[3] = 2500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = HammerDrone;
    resourceRewards.values[0] = 300;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidFactoryResourcesID
    objective = RaidFactoryResourcesID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 1);
    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = IronPlateCraftedItemID;
    resourceRewards.values[0] = 200000;
    resourceRewards.resources[1] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[1] = 200000;
    resourceRewards.resources[2] = AlloyCraftedItemID;
    resourceRewards.values[2] = 200000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidFactoryResources2ID
    objective = RaidFactoryResources2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidFactoryResourcesID
    );
    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = IronPlateCraftedItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[1] = 500000;
    resourceRewards.resources[2] = AlloyCraftedItemID;
    resourceRewards.values[2] = 500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidFactoryResources3ID
    objective = RaidFactoryResources3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidFactoryResources2ID
    );
    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = IronPlateCraftedItemID;
    resourceRewards.values[0] = 2500000;
    resourceRewards.resources[1] = PhotovoltaicCellCraftedItemID;
    resourceRewards.values[1] = 2500000;
    resourceRewards.resources[2] = AlloyCraftedItemID;
    resourceRewards.values[2] = 2500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    //RaidMotherlodeResourcesID
    objective = RaidMotherlodeResourcesID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 1);
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 200000;
    resourceRewards.resources[1] = PlatinumResourceItemID;
    resourceRewards.values[1] = 200000;
    resourceRewards.resources[2] = IridiumResourceItemID;
    resourceRewards.values[2] = 200000;
    resourceRewards.resources[3] = KimberliteResourceItemID;
    resourceRewards.values[3] = 200000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 30;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidMotherlodeResources2ID
    objective = RaidMotherlodeResources2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidMotherlodeResourcesID
    );
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 500000;
    resourceRewards.resources[1] = PlatinumResourceItemID;
    resourceRewards.values[1] = 500000;
    resourceRewards.resources[2] = IridiumResourceItemID;
    resourceRewards.values[2] = 500000;
    resourceRewards.resources[3] = KimberliteResourceItemID;
    resourceRewards.values[3] = 500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 100;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);

    //RaidMotherlodeResources3ID
    objective = RaidMotherlodeResources3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      RaidMotherlodeResources2ID
    );
    resourceRewards = ResourceValues(new uint256[](4), new uint32[](4));
    resourceRewards.resources[0] = TitaniumResourceItemID;
    resourceRewards.values[0] = 2500000;
    resourceRewards.resources[1] = PlatinumResourceItemID;
    resourceRewards.values[1] = 2500000;
    resourceRewards.resources[2] = IridiumResourceItemID;
    resourceRewards.values[2] = 2500000;
    resourceRewards.resources[3] = KimberliteResourceItemID;
    resourceRewards.values[3] = 2500000;
    P_RaidRequirementComponent(world.getComponent(P_RaidRequirementComponentID)).set(objective, resourceRewards);

    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 300;
    P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).set(objective, resourceRewards);
  }

  function initDestroyUnitsObjective(IWorld world) internal {
    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(world.getComponent(P_IsObjectiveComponentID));

    uint256 objective;
    ResourceValues memory resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));

    //DestroyEnemyUnitsID
    objective = DestroyEnemyUnitsID;
    isObjectiveComponent.set(objective);
    LevelComponent(world.getComponent(LevelComponentID)).set(objective, 1);
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = MinutemanMarine;
    resourceRewards.values[0] = 500;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 300000;
    resourceRewards.resources[1] = SulfurResourceItemID;
    resourceRewards.values[1] = 300000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //DestroyEnemyUnits2ID
    objective = DestroyEnemyUnits2ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DestroyEnemyUnitsID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = TridentMarine;
    resourceRewards.values[0] = 500;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 1000000;
    resourceRewards.resources[1] = SulfurResourceItemID;
    resourceRewards.values[1] = 1000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //DestroyEnemyUnits3ID
    objective = DestroyEnemyUnits3ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DestroyEnemyUnitsID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AnvilDrone;
    resourceRewards.values[0] = 300;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 3000000;
    resourceRewards.resources[1] = SulfurResourceItemID;
    resourceRewards.values[1] = 3000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //DestroyEnemyUnits4ID
    objective = DestroyEnemyUnits4ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DestroyEnemyUnits3ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = AegisDrone;
    resourceRewards.values[0] = 300;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](2), new uint32[](2));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 30000000;
    resourceRewards.resources[1] = SulfurResourceItemID;
    resourceRewards.values[1] = 30000000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);

    //DestroyEnemyUnits5ID
    objective = DestroyEnemyUnits5ID;
    isObjectiveComponent.set(objective);
    P_ObjectiveRequirementComponent(world.getComponent(P_ObjectiveRequirementComponentID)).set(
      objective,
      DestroyEnemyUnits4ID
    );
    resourceRewards = ResourceValues(new uint256[](1), new uint32[](1));
    resourceRewards.resources[0] = StingerDrone;
    resourceRewards.values[0] = 300;
    P_DestroyedUnitsRequirementComponent(world.getComponent(P_DestroyedUnitsRequirementComponentID)).set(
      objective,
      resourceRewards
    );

    resourceRewards = ResourceValues(new uint256[](3), new uint32[](3));
    resourceRewards.resources[0] = CopperResourceItemID;
    resourceRewards.values[0] = 50000000;
    resourceRewards.resources[1] = TitaniumResourceItemID;
    resourceRewards.values[1] = 300000;
    resourceRewards.resources[2] = PlatinumResourceItemID;
    resourceRewards.values[2] = 300000;
    P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID)).set(objective, resourceRewards);
  }
}
