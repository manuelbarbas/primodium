// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { P_UnitRequirementComponent, ID as P_UnitRequirementComponentID } from "components/P_UnitRequirementComponent.sol";
import { P_SpawnPirateAsteroidComponent, ID as P_SpawnPirateAsteroidComponentID } from "components/P_SpawnPirateAsteroidComponent.sol";
import { P_UnitRewardComponent, ID as P_UnitRewardComponentID } from "components/P_UnitRewardComponent.sol";
import { P_ObjectiveRequirementComponent, ID as P_ObjectiveRequirementComponentID } from "components/P_ObjectiveRequirementComponent.sol";
import { P_ResourceRewardComponent, ID as P_ResourceRewardComponentID } from "components/P_ResourceRewardComponent.sol";
import { P_HasBuiltBuildingComponent, ID as P_HasBuiltBuildingComponentID } from "components/P_HasBuiltBuildingComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue, ResourceValues, Dimensions, Coord } from "../types.sol";

// Research
import "../prototypes.sol";
import "../prototypes/Objectives.sol";
import "../prototypes/PirateAsteroids.sol";

library LibInitPirateAsteroids {
  function init(IWorld world) internal {
    uint256 pirateAsteroid;
    ResourceValues memory resourceValues = ResourceValues(new uint256[](1), new uint32[](1));

    //FirstPirateAsteroidID
    pirateAsteroid = FirstPirateAsteroidID;
    PositionComponent(world.getComponent(PositionComponentID)).set(pirateAsteroid, Coord(10, 10, 0));
    resourceValues = ResourceValues(new uint256[](1), new uint32[](1));
    resourceValues.resources[0] = MarineUnit;
    resourceValues.values[0] = 10;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(pirateAsteroid, resourceValues);
    resourceValues = ResourceValues(new uint256[](1), new uint32[](1));
    resourceValues.resources[0] = CopperResourceItemID;
    resourceValues.values[0] = 50000;
    LibSetBuildingReqs.setResourceReqs(world, pirateAsteroid, resourceValues);

    //SecondPirateAsteroidID
    pirateAsteroid = SecondPirateAsteroidID;
    PositionComponent(world.getComponent(PositionComponentID)).set(pirateAsteroid, Coord(10, 10, 0));
    resourceValues = ResourceValues(new uint256[](1), new uint32[](1));
    resourceValues.resources[0] = MarineUnit;
    resourceValues.values[0] = 40;
    P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID)).set(pirateAsteroid, resourceValues);
    resourceValues = ResourceValues(new uint256[](3), new uint32[](3));
    resourceValues.resources[0] = CopperResourceItemID;
    resourceValues.values[0] = 50000;
    resourceValues.resources[1] = IronResourceItemID;
    resourceValues.values[1] = 50000;
    resourceValues.resources[2] = IronPlateCraftedItemID;
    resourceValues.values[2] = 50000;
    LibSetBuildingReqs.setResourceReqs(world, pirateAsteroid, resourceValues);
  }
}
