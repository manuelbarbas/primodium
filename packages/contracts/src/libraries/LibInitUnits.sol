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
import { ResourceValue, ResourceValues, UnitDesign } from "../types.sol";

uint32 constant NONE = 0;

library LibInitUnits {
  function init(IWorld world) internal {
    initAnvilDrone(world);
    initAegisDrone(world);
    initHammerDrone(world);
    initStingerDrone(world);
    initMiningVessel(world);
    initMarine(world);
    initAdvancedMarine(world);
  }

  function setupUnit(
    IWorld world,
    uint256 unitType,
    uint32 maxLevel,
    UnitDesign[] memory unitDesign,
    ResourceValue[][] memory requiredResources,
    ResourceValues[] memory requiredUtilities
  ) internal {
    P_IsUnitComponent(world.getComponent(P_IsBuildingTypeComponentID)).set(unitType);
    P_MaxLevelComponent(world.getComponent(P_MaxLevelComponentID)).set(unitType, maxLevel);
    for (uint256 i = 0; i < maxLevel; i++) {
      uint256 level = i;
      uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, level);
      P_RequiredUtilityComponent(world.getComponent(P_RequiredUtilityComponentID)).set(
        unitLevelEntity,
        requiredUtilities[i]
      );
      P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID)).set(unitLevelEntity, unitDesign[i].attack);
      P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID)).set(unitLevelEntity, unitDesign[i].defence);
      P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).set(
        unitLevelEntity,
        unitDesign[i].speed
      );
      P_UnitCargoComponent(world.getComponent(P_UnitCargoComponentID)).set(unitLevelEntity, unitDesign[i].cargo);
      P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID)).set(unitLevelEntity, unitDesign[i].mining);
      P_UnitTrainingTimeComponent(world.getComponent(P_UnitTrainingTimeComponentID)).set(
        unitLevelEntity,
        unitDesign[i].trainingTime
      );
      LibSetBuildingReqs.setResourceReqs(world, unitLevelEntity, requiredResources[i]);
    }
  }

  /******************************** Units ********************************** */
  function initAnvilDrone(IWorld world) internal {
    uint256 unitType = AnvilDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);

    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[4] = resourceValues;

    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 2000 });
    requiredResources[5] = resourceValues;

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

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 40;
    unitDesigns[1].attack = 42;
    unitDesigns[2].attack = 44;
    unitDesigns[3].attack = 46;
    unitDesigns[4].attack = 48;
    unitDesigns[5].attack = 50;

    /****************** Defences *******************/

    unitDesigns[0].defence = 150;
    unitDesigns[1].defence = 157;
    unitDesigns[2].defence = 165;
    unitDesigns[3].defence = 172;
    unitDesigns[4].defence = 180;
    unitDesigns[5].defence = 187;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 1000;
    unitDesigns[1].cargo = 1000;
    unitDesigns[2].cargo = 1000;
    unitDesigns[3].cargo = 1000;
    unitDesigns[4].cargo = 1000;
    unitDesigns[5].cargo = 1000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 20;
    unitDesigns[1].speed = 20;
    unitDesigns[2].speed = 20;
    unitDesigns[3].speed = 20;
    unitDesigns[4].speed = 20;
    unitDesigns[5].speed = 20;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 30;
    unitDesigns[1].trainingTime = 30;
    unitDesigns[2].trainingTime = 30;
    unitDesigns[3].trainingTime = 30;
    unitDesigns[4].trainingTime = 30;
    unitDesigns[5].trainingTime = 30;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initMarine(IWorld world) internal {
    uint256 unitType = MinutemanMarine;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);

    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[4] = resourceValues;

    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[5] = resourceValues;

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

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 40;
    unitDesigns[1].attack = 42;
    unitDesigns[2].attack = 44;
    unitDesigns[3].attack = 46;
    unitDesigns[4].attack = 48;
    unitDesigns[5].attack = 50;

    /****************** Defences *******************/

    unitDesigns[0].defence = 20;
    unitDesigns[1].defence = 21;
    unitDesigns[2].defence = 23;
    unitDesigns[3].defence = 25;
    unitDesigns[4].defence = 27;
    unitDesigns[5].defence = 30;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 1000;
    unitDesigns[1].cargo = 1000;
    unitDesigns[2].cargo = 1000;
    unitDesigns[3].cargo = 1000;
    unitDesigns[4].cargo = 1000;
    unitDesigns[5].cargo = 1000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 20;
    unitDesigns[1].speed = 20;
    unitDesigns[2].speed = 20;
    unitDesigns[3].speed = 20;
    unitDesigns[4].speed = 20;
    unitDesigns[5].speed = 20;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 20;
    unitDesigns[1].trainingTime = 20;
    unitDesigns[2].trainingTime = 20;
    unitDesigns[3].trainingTime = 20;
    unitDesigns[4].trainingTime = 20;
    unitDesigns[5].trainingTime = 20;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initAdvancedMarine(IWorld world) internal {
    uint256 unitType = TridentMinutemanMarine;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);

    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[4] = resourceValues;

    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    requiredResources[5] = resourceValues;

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

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 80;
    unitDesigns[1].attack = 84;
    unitDesigns[2].attack = 90;
    unitDesigns[3].attack = 95;
    unitDesigns[4].attack = 100;
    unitDesigns[5].attack = 110;

    /****************** Defences *******************/

    unitDesigns[0].defence = 150;
    unitDesigns[1].defence = 157;
    unitDesigns[2].defence = 165;
    unitDesigns[3].defence = 172;
    unitDesigns[4].defence = 180;
    unitDesigns[5].defence = 187;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 2000;
    unitDesigns[1].cargo = 2000;
    unitDesigns[2].cargo = 2000;
    unitDesigns[3].cargo = 2000;
    unitDesigns[4].cargo = 2000;
    unitDesigns[5].cargo = 2000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 20;
    unitDesigns[1].speed = 20;
    unitDesigns[2].speed = 20;
    unitDesigns[3].speed = 20;
    unitDesigns[4].speed = 20;
    unitDesigns[5].speed = 20;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 40;
    unitDesigns[1].trainingTime = 40;
    unitDesigns[2].trainingTime = 40;
    unitDesigns[3].trainingTime = 40;
    unitDesigns[4].trainingTime = 40;
    unitDesigns[5].trainingTime = 40;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initAegisDrone(IWorld world) internal {
    uint256 unitType = AegisDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[4] = resourceValues;

    // LEVEL 6
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: AlloyCraftedItemID, value: 3000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 1000 });
    requiredResources[5] = resourceValues;

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

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 3;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 150;
    unitDesigns[1].attack = 157;
    unitDesigns[2].attack = 165;
    unitDesigns[3].attack = 172;
    unitDesigns[4].attack = 180;
    unitDesigns[5].attack = 187;

    /****************** Defences *******************/

    unitDesigns[0].defence = 400;
    unitDesigns[1].defence = 420;
    unitDesigns[2].defence = 440;
    unitDesigns[3].defence = 460;
    unitDesigns[4].defence = 480;
    unitDesigns[5].defence = 500;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 10000;
    unitDesigns[1].cargo = 10000;
    unitDesigns[2].cargo = 10000;
    unitDesigns[3].cargo = 10000;
    unitDesigns[4].cargo = 10000;
    unitDesigns[5].cargo = 10000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 14;
    unitDesigns[1].speed = 14;
    unitDesigns[2].speed = 14;
    unitDesigns[3].speed = 14;
    unitDesigns[4].speed = 14;
    unitDesigns[5].speed = 14;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 150;
    unitDesigns[1].trainingTime = 150;
    unitDesigns[2].trainingTime = 150;
    unitDesigns[3].trainingTime = 150;
    unitDesigns[4].trainingTime = 150;
    unitDesigns[5].trainingTime = 150;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initHammerDrone(IWorld world) internal {
    uint256 unitType = HammerDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[2] = resourceValues;
    // LEVEL 4
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[4] = resourceValues;
    // LEVEL 6
    resourceValues = new ResourceValue[](2);
    resourceValues[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 10000 });
    resourceValues[1] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 4000 });
    requiredResources[5] = resourceValues;

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

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 140;
    unitDesigns[1].attack = 147;
    unitDesigns[2].attack = 154;
    unitDesigns[3].attack = 161;
    unitDesigns[4].attack = 168;
    unitDesigns[5].attack = 174;

    /****************** Defences *******************/

    unitDesigns[0].defence = 50;
    unitDesigns[1].defence = 52;
    unitDesigns[2].defence = 55;
    unitDesigns[3].defence = 57;
    unitDesigns[4].defence = 60;
    unitDesigns[5].defence = 62;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 2000;
    unitDesigns[1].cargo = 2000;
    unitDesigns[2].cargo = 2000;
    unitDesigns[3].cargo = 2000;
    unitDesigns[4].cargo = 2000;
    unitDesigns[5].cargo = 2000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 16;
    unitDesigns[1].speed = 16;
    unitDesigns[2].speed = 16;
    unitDesigns[3].speed = 16;
    unitDesigns[4].speed = 16;
    unitDesigns[5].speed = 16;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 60;
    unitDesigns[1].trainingTime = 60;
    unitDesigns[2].trainingTime = 60;
    unitDesigns[3].trainingTime = 60;
    unitDesigns[4].trainingTime = 60;
    unitDesigns[5].trainingTime = 60;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initStingerDrone(IWorld world) internal {
    uint256 unitType = StingerDrone;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[2] = resourceValues;

    // LEVEL 4
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[3] = resourceValues;

    // LEVEL 5
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[4] = resourceValues;

    // LEVEL 6
    resourceValues = new ResourceValue[](1);
    resourceValues[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 1500 });
    requiredResources[5] = resourceValues;

    /****************** Required Utility Resources *******************/

    ResourceValues[] memory requiredUtilities = new ResourceValues[](maxLevel);

    uint256[] memory utilityResourceIds;
    uint32[] memory utilityResourceAmounts;

    // LEVEL 1
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[0] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 2
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[1] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 3
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[2] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 4
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[3] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 5
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[4] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = HousingUtilityResourceID;
    utilityResourceAmounts[0] = 2;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 550;
    unitDesigns[1].attack = 587;
    unitDesigns[2].attack = 625;
    unitDesigns[3].attack = 662;
    unitDesigns[4].attack = 700;
    unitDesigns[5].attack = 737;

    /****************** Defences *******************/

    unitDesigns[0].defence = 150;
    unitDesigns[1].defence = 157;
    unitDesigns[2].defence = 165;
    unitDesigns[3].defence = 172;
    unitDesigns[4].defence = 180;
    unitDesigns[5].defence = 187;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 20000;
    unitDesigns[1].cargo = 20000;
    unitDesigns[2].cargo = 20000;
    unitDesigns[3].cargo = 20000;
    unitDesigns[4].cargo = 20000;
    unitDesigns[5].cargo = 20000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 10;
    unitDesigns[1].speed = 10;
    unitDesigns[2].speed = 10;
    unitDesigns[3].speed = 10;
    unitDesigns[4].speed = 10;
    unitDesigns[5].speed = 10;

    /****************** Minings *******************/

    unitDesigns[0].mining = 0;
    unitDesigns[1].mining = 0;
    unitDesigns[2].mining = 0;
    unitDesigns[3].mining = 0;
    unitDesigns[4].mining = 0;
    unitDesigns[5].mining = 0;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 200;
    unitDesigns[1].trainingTime = 200;
    unitDesigns[2].trainingTime = 200;
    unitDesigns[3].trainingTime = 200;
    unitDesigns[4].trainingTime = 200;
    unitDesigns[5].trainingTime = 200;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }

  function initMiningVessel(IWorld world) internal {
    uint256 unitType = MiningVessel;
    P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).set(unitType);
    uint32 maxLevel = 6;

    /****************** Required Resources *******************/
    ResourceValue[][] memory requiredResources = new ResourceValue[][](maxLevel);
    // LEVEL 1
    ResourceValue[] memory resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[0] = resourceValues;
    // LEVEL 2
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[1] = resourceValues;
    // LEVEL 3
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[2] = resourceValues;
    // LEVEL 4
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[3] = resourceValues;
    // LEVEL 5
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[4] = resourceValues;
    // LEVEL 6
    resourceValues = new ResourceValue[](3);
    resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 20000 });
    resourceValues[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 30000 });
    resourceValues[2] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    requiredResources[5] = resourceValues;

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
    // LEVEL 6
    utilityResourceIds = new uint256[](1);
    utilityResourceAmounts = new uint32[](1);
    utilityResourceIds[0] = VesselUtilityResourceID;
    utilityResourceAmounts[0] = 1;
    requiredUtilities[5] = ResourceValues(utilityResourceIds, utilityResourceAmounts);

    UnitDesign[] memory unitDesigns = new UnitDesign[](maxLevel);
    /****************** Attacks *******************/

    unitDesigns[0].attack = 20;
    unitDesigns[1].attack = 25;
    unitDesigns[2].attack = 35;
    unitDesigns[3].attack = 45;
    unitDesigns[4].attack = 55;
    unitDesigns[5].attack = 55;

    /****************** Defences *******************/

    unitDesigns[0].defence = 50;
    unitDesigns[1].defence = 70;
    unitDesigns[2].defence = 90;
    unitDesigns[3].defence = 110;
    unitDesigns[4].defence = 130;
    unitDesigns[5].defence = 150;

    /****************** Cargos *******************/

    unitDesigns[0].cargo = 30000;
    unitDesigns[1].cargo = 30000;
    unitDesigns[2].cargo = 30000;
    unitDesigns[3].cargo = 30000;
    unitDesigns[4].cargo = 30000;
    unitDesigns[5].cargo = 30000;

    /****************** Speeds *******************/

    unitDesigns[0].speed = 16;
    unitDesigns[1].speed = 16;
    unitDesigns[2].speed = 16;
    unitDesigns[3].speed = 16;
    unitDesigns[4].speed = 16;
    unitDesigns[5].speed = 16;

    /****************** Minings *******************/

    unitDesigns[0].mining = 1;
    unitDesigns[1].mining = 2;
    unitDesigns[2].mining = 3;
    unitDesigns[3].mining = 4;
    unitDesigns[4].mining = 5;
    unitDesigns[5].mining = 6;

    /****************** Training Times *******************/

    unitDesigns[0].trainingTime = 100;
    unitDesigns[1].trainingTime = 100;
    unitDesigns[2].trainingTime = 100;
    unitDesigns[3].trainingTime = 100;
    unitDesigns[4].trainingTime = 100;
    unitDesigns[5].trainingTime = 100;

    /* ***********************Set Values ************************* */
    setupUnit(world, unitType, maxLevel, unitDesigns, requiredResources, requiredUtilities);
  }
}
