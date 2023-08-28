// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
// Production Buildings
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID, ResourceValue } from "components/P_UtilityProductionComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_MaxMovesComponent, ID as P_MaxMovesComponentID } from "components/P_MaxMovesComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { P_UnitAttackComponent, ID as P_UnitAttackComponentID } from "components/P_UnitAttackComponent.sol";
import { P_UnitDefenceComponent, ID as P_UnitDefenceComponentID } from "components/P_UnitDefenceComponent.sol";
import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { P_UnitCargoComponent, ID as P_UnitCargoComponentID } from "components/P_UnitCargoComponent.sol";
import { P_UnitMiningComponent, ID as P_UnitMiningComponentID } from "components/P_UnitMiningComponent.sol";
import { P_UnitTrainingTimeComponent, ID as P_UnitTrainingTimeComponentID } from "components/P_UnitTrainingTimeComponent.sol";
import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";

import "../prototypes.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

uint32 constant NONE = 0;

library LibInitUnits {
  function init(IWorld world) internal {
    initAnvileDrone(world);
    initAegisDrone(world);
    initHammerDrone(world);
    initStingerDrone(world);
    initMiningVessel(world);
  }

  function setupUnit(
    IWorld world,
    uint256 unitType,
    uint32 maxLevel,
    uint32[] memory attacks,
    uint32[] memory defences,
    uint32[] memory cargos,
    uint32[] memory speeds,
    uint32[] memory minings,
    uint32[] memory trainingTime,
    ResourceValue[][] memory requiredResources,
    ResourceValues[] memory requiredUtilities
  ) internal {
    P_IsUnitComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(unitType);

    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i;
      uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, level);
      P_RequiredUtilityComponent(world.getComponent(P_RequiredUtilityComponentID)).set(
        unitLevelEntity,
        requiredUtilities[i]
      );
      P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID)).set(unitLevelEntity, attacks[i]);
      P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID)).set(unitLevelEntity, defences[i]);
      P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).set(unitLevelEntity, speeds[i]);
      P_UnitCargoComponent(world.getComponent(P_UnitCargoComponentID)).set(unitLevelEntity, cargos[i]);
      P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID)).set(unitLevelEntity, minings[i]);
      P_UnitTrainingTimeComponent(world.getComponent(P_UnitTrainingTimeComponentID)).set(
        unitLevelEntity,
        trainingTime[i]
      );
      LibSetBuildingReqs.setResourceReqs(world, unitLevelEntity, requiredResources[i]);
    }
  }

  /******************************** Mines ********************************** */

  function initAnvileDrone(IWorld world) internal {
    uint256 unitType = AnvilDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);

    uint32 maxLevel = 5;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 1000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    resourceValues[2] = ResourceValue({ resource: AlloyCraftedItemID, value: 1000 });
    requiredResources[4] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    /****************** Attacks *******************/

    uint32[] memory attacks = new uint32[](maxLevel);
    attacks[0] = 40;
    attacks[1] = 42;
    attacks[2] = 44;
    attacks[3] = 46;
    attacks[4] = 48;
    attacks[5] = 50;

    /****************** Defences *******************/
    uint32[] memory defences = new uint32[](maxLevel);
    defences[0] = 150;
    defences[1] = 157;
    defences[2] = 165;
    defences[3] = 172;
    defences[4] = 180;
    defences[5] = 187;

    /****************** Cargos *******************/
    uint32[] memory cargos = new uint32[](maxLevel);
    cargos[0] = 20000;
    cargos[1] = 20000;
    cargos[2] = 20000;
    cargos[3] = 20000;
    cargos[4] = 20000;
    cargos[5] = 20000;

    /****************** Speeds *******************/
    uint32[] memory speeds = new uint32[](maxLevel);
    speeds[0] = 20;
    speeds[1] = 20;
    speeds[2] = 20;
    speeds[3] = 20;
    speeds[4] = 20;
    speeds[5] = 20;

    /****************** Minings *******************/
    uint32[] memory minings = new uint32[](maxLevel);
    minings[0] = 0;
    minings[1] = 0;
    minings[2] = 0;
    minings[3] = 0;
    minings[4] = 0;
    minings[5] = 0;

    /****************** Training Times *******************/
    uint32[] memory trainingTime = new uint32[](maxLevel);
    trainingTime[0] = 30;
    trainingTime[1] = 30;
    trainingTime[2] = 30;
    trainingTime[3] = 30;
    trainingTime[4] = 30;
    trainingTime[5] = 30;

    /* ***********************Set Values ************************* */
    setupUnit(
      world,
      unitType,
      maxLevel,
      attacks,
      defences,
      cargos,
      speeds,
      minings,
      trainingTime,
      requiredResources,
      requiredUtilities
    );
  }

  function initAegisDrone(IWorld world) internal {
    uint256 unitType = AegisDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 5;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    requiredResources[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    requiredResources[4] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    /****************** Attacks *******************/

    uint32[] memory attacks = new uint32[](maxLevel);
    attacks[0] = 150;
    attacks[1] = 157;
    attacks[2] = 165;
    attacks[3] = 172;
    attacks[4] = 180;
    attacks[5] = 187;

    /****************** Defences *******************/
    uint32[] memory defences = new uint32[](maxLevel);
    defences[0] = 400;
    defences[1] = 420;
    defences[2] = 440;
    defences[3] = 460;
    defences[4] = 480;
    defences[5] = 500;

    /****************** Cargos *******************/
    uint32[] memory cargos = new uint32[](maxLevel);
    cargos[0] = 500;
    cargos[1] = 500;
    cargos[2] = 500;
    cargos[3] = 500;
    cargos[4] = 500;
    cargos[5] = 500;

    /****************** Speeds *******************/
    uint32[] memory speeds = new uint32[](maxLevel);
    speeds[0] = 14;
    speeds[1] = 14;
    speeds[2] = 14;
    speeds[3] = 14;
    speeds[4] = 14;
    speeds[5] = 14;

    /****************** Minings *******************/
    uint32[] memory minings = new uint32[](maxLevel);
    minings[0] = 0;
    minings[1] = 0;
    minings[2] = 0;
    minings[3] = 0;
    minings[4] = 0;
    minings[5] = 0;

    /****************** Training Times *******************/
    uint32[] memory trainingTime = new uint32[](maxLevel);
    trainingTime[0] = 150;
    trainingTime[1] = 150;
    trainingTime[2] = 150;
    trainingTime[3] = 150;
    trainingTime[4] = 150;
    trainingTime[5] = 150;

    /* ***********************Set Values ************************* */
    setupUnit(
      world,
      unitType,
      maxLevel,
      attacks,
      defences,
      cargos,
      speeds,
      minings,
      trainingTime,
      requiredResources,
      requiredUtilities
    );
  }

  function initHammerDrone(IWorld world) internal {
    uint256 unitType = HammerDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 5;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });
    requiredResources[2] = resourceValues;
    // LEVEL 4
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: TitaniumResourceItemID, value: 500 });
    requiredResources[4] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    /****************** Attacks *******************/

    uint32[] memory attacks = new uint32[](maxLevel);
    attacks[0] = 147;
    attacks[1] = 144;
    attacks[2] = 154;
    attacks[3] = 161;
    attacks[4] = 168;
    attacks[5] = 174;

    /****************** Defences *******************/
    uint32[] memory defences = new uint32[](maxLevel);
    defences[0] = 50;
    defences[1] = 52;
    defences[2] = 55;
    defences[3] = 57;
    defences[4] = 60;
    defences[5] = 62;

    /****************** Cargos *******************/
    uint32[] memory cargos = new uint32[](maxLevel);
    cargos[0] = 600;
    cargos[1] = 600;
    cargos[2] = 600;
    cargos[3] = 600;
    cargos[4] = 600;
    cargos[5] = 600;

    /****************** Speeds *******************/
    uint32[] memory speeds = new uint32[](maxLevel);
    speeds[0] = 16;
    speeds[1] = 16;
    speeds[2] = 16;
    speeds[3] = 16;
    speeds[4] = 16;
    speeds[5] = 16;

    /****************** Minings *******************/
    uint32[] memory minings = new uint32[](maxLevel);
    minings[0] = 0;
    minings[1] = 0;
    minings[2] = 0;
    minings[3] = 0;
    minings[4] = 0;
    minings[5] = 0;

    /****************** Training Times *******************/
    uint32[] memory trainingTime = new uint32[](maxLevel);
    trainingTime[0] = 60;
    trainingTime[1] = 60;
    trainingTime[2] = 60;
    trainingTime[3] = 60;
    trainingTime[4] = 60;
    trainingTime[5] = 60;

    /* ***********************Set Values ************************* */
    setupUnit(
      world,
      unitType,
      maxLevel,
      attacks,
      defences,
      cargos,
      speeds,
      minings,
      trainingTime,
      requiredResources,
      requiredUtilities
    );
  }

  function initStingerDrone(IWorld world) internal {
    uint256 unitType = StingerDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 5;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    resourceValues[2] = ResourceValue({ resource: IridiumResourceItemID, value: 1000 });
    resourceValues[3] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    resourceValues[2] = ResourceValue({ resource: IridiumResourceItemID, value: 1000 });
    resourceValues[3] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    resourceValues[2] = ResourceValue({ resource: IridiumResourceItemID, value: 1000 });
    resourceValues[3] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    resourceValues[2] = ResourceValue({ resource: IridiumResourceItemID, value: 1000 });
    resourceValues[3] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });
    requiredResources[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](4);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PlatinumResourceItemID, value: 1000 });
    resourceValues[2] = ResourceValue({ resource: IridiumResourceItemID, value: 1000 });
    resourceValues[3] = ResourceValue({ resource: KimberliteResourceItemID, value: 500 });
    requiredResources[4] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    /****************** Attacks *******************/

    uint32[] memory attacks = new uint32[](maxLevel);
    attacks[0] = 550;
    attacks[1] = 587;
    attacks[2] = 625;
    attacks[3] = 662;
    attacks[4] = 700;
    attacks[5] = 737;

    /****************** Defences *******************/
    uint32[] memory defences = new uint32[](maxLevel);
    defences[0] = 150;
    defences[1] = 157;
    defences[2] = 165;
    defences[3] = 172;
    defences[4] = 180;
    defences[5] = 187;

    /****************** Cargos *******************/
    uint32[] memory cargos = new uint32[](maxLevel);
    cargos[0] = 1500;
    cargos[1] = 1500;
    cargos[2] = 1500;
    cargos[3] = 1500;
    cargos[4] = 1500;
    cargos[5] = 1500;

    /****************** Speeds *******************/
    uint32[] memory speeds = new uint32[](maxLevel);
    speeds[0] = 10;
    speeds[1] = 10;
    speeds[2] = 10;
    speeds[3] = 10;
    speeds[4] = 10;
    speeds[5] = 10;

    /****************** Minings *******************/
    uint32[] memory minings = new uint32[](maxLevel);
    minings[0] = 0;
    minings[1] = 0;
    minings[2] = 0;
    minings[3] = 0;
    minings[4] = 0;
    minings[5] = 0;

    /****************** Training Times *******************/
    uint32[] memory trainingTime = new uint32[](maxLevel);
    trainingTime[0] = 200;
    trainingTime[1] = 200;
    trainingTime[2] = 200;
    trainingTime[3] = 200;
    trainingTime[4] = 200;
    trainingTime[5] = 200;

    /* ***********************Set Values ************************* */
    setupUnit(
      world,
      unitType,
      maxLevel,
      attacks,
      defences,
      cargos,
      speeds,
      minings,
      trainingTime,
      requiredResources,
      requiredUtilities
    );
  }

  function initMiningVessel(IWorld world) internal {
    uint256 unitType = MiningVessel;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 5;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[2] = resourceValues;
    // LEVEL 4
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 2000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[4] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    /****************** Attacks *******************/

    uint32[] memory attacks = new uint32[](maxLevel);
    attacks[0] = 0;
    attacks[1] = 0;
    attacks[2] = 0;
    attacks[3] = 0;
    attacks[4] = 0;
    attacks[5] = 0;

    /****************** Defences *******************/
    uint32[] memory defences = new uint32[](maxLevel);
    defences[0] = 0;
    defences[1] = 0;
    defences[2] = 0;
    defences[3] = 0;
    defences[4] = 0;
    defences[5] = 0;

    /****************** Cargos *******************/
    uint32[] memory cargos = new uint32[](maxLevel);
    cargos[0] = 600;
    cargos[1] = 600;
    cargos[2] = 600;
    cargos[3] = 600;
    cargos[4] = 600;
    cargos[5] = 600;

    /****************** Speeds *******************/
    uint32[] memory speeds = new uint32[](maxLevel);
    speeds[0] = 16;
    speeds[1] = 16;
    speeds[2] = 16;
    speeds[3] = 16;
    speeds[4] = 16;
    speeds[5] = 16;

    /****************** Minings *******************/
    uint32[] memory minings = new uint32[](maxLevel);
    minings[0] = 1;
    minings[1] = 1;
    minings[2] = 1;
    minings[3] = 1;
    minings[4] = 1;
    minings[5] = 1;

    /****************** Training Times *******************/
    uint32[] memory trainingTime = new uint32[](maxLevel);
    trainingTime[0] = 100;
    trainingTime[1] = 100;
    trainingTime[2] = 100;
    trainingTime[3] = 100;
    trainingTime[4] = 100;
    trainingTime[5] = 100;

    /* ***********************Set Values ************************* */
    setupUnit(
      world,
      unitType,
      maxLevel,
      attacks,
      defences,
      cargos,
      speeds,
      minings,
      trainingTime,
      requiredResources,
      requiredUtilities
    );
  }
}
