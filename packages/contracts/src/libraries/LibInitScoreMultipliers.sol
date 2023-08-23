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
    scoreMultiplierComponent.set(SulfurID, 30);
    scoreMultiplierComponent.set(TitaniumID, 100);
    scoreMultiplierComponent.set(IridiumID, 200);
    scoreMultiplierComponent.set(OsmiumID, 300);
    scoreMultiplierComponent.set(TungstenID, 400);
    scoreMultiplierComponent.set(KimberliteID, 1000);
    scoreMultiplierComponent.set(PlatinumID, 1500);
    scoreMultiplierComponent.set(UraniniteID, 2000);
    scoreMultiplierComponent.set(BolutiteID, 2500);

    scoreMultiplierComponent.set(IronPlateCraftedItemID, 30);
    scoreMultiplierComponent.set(LithiumCopperOxideCraftedItemID, 60);
    scoreMultiplierComponent.set(AlloyCraftedItemID, 100);
    scoreMultiplierComponent.set(SpaceFuelCraftedItemID, 200);
  }
}
