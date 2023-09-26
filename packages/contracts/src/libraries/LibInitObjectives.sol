// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
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
import { ResourceValue, Dimensions } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInitObjectives {
  function init(IWorld world) internal {}
}
