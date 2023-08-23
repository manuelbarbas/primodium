// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { P_ScoreMultiplierComponent, ID as P_ScoreMultiplierComponentID } from "components/P_ScoreMultiplierComponent.sol";
// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue, Dimensions, EMotherlodeType, EMotherlodeSize } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInitScoreMultipliers {
  function init(IWorld world) internal {
    initResources(world);
  }

  function initResources(IWorld world) internal {
    P_ScoreMultiplierComponent scoreMultiplierComponent = P_ScoreMultiplierComponent(
      world.getComponent(P_ScoreMultiplierComponentID)
    );

    scoreMultiplierComponent.set(IronID, 10);
    scoreMultiplierComponent.set(CopperID, 15);
    scoreMultiplierComponent.set(LithiumID, 20);
    scoreMultiplierComponent.set(SulfurID, 25);
    scoreMultiplierComponent.set(TitaniumID, 30);
    scoreMultiplierComponent.set(IridiumID, 40);
    scoreMultiplierComponent.set(OsmiumID, 50);
    scoreMultiplierComponent.set(TungstenID, 70);
    scoreMultiplierComponent.set(KimberliteID, 100);
    scoreMultiplierComponent.set(PlatinumID, 150);
    scoreMultiplierComponent.set(UraniniteID, 200);
    scoreMultiplierComponent.set(BolutiteID, 250);
  }
}
