// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { ScoreTableId, AllianceTableId, ResourceCountTableId } from "codegen/index.sol";
import { OnResourceCount_Score } from "src/hooks/storeHooks/OnResourceCount_Score.sol";
import { OnScore_Alliance_Score } from "src/hooks/storeHooks/OnScore_Alliance_Score.sol";

import { BEFORE_SPLICE_STATIC_DATA } from "@latticexyz/store/src/storeHookTypes.sol";

function setupHooks(IWorld world) {
  registerScoreHook(world);
}

/**
 * @dev Registers a store hook for between ResourceCount and the Score tables.
 * @param world The World contract instance.
 */
function registerScoreHook(IWorld world) {
  OnResourceCount_Score onResourceCount_Score = new OnResourceCount_Score();
  console.log("onResourceCount_Score address: %s", address(onResourceCount_Score));
  world.grantAccess(ScoreTableId, address(onResourceCount_Score));
  world.registerStoreHook(ResourceCountTableId, onResourceCount_Score, BEFORE_SPLICE_STATIC_DATA);

  OnScore_Alliance_Score onScore_Alliance_Score = new OnScore_Alliance_Score();
  console.log("onScore_Alliance_Score address: %s", address(onScore_Alliance_Score));
  world.grantAccess(AllianceTableId, address(onScore_Alliance_Score));
  world.registerStoreHook(ScoreTableId, onScore_Alliance_Score, BEFORE_SPLICE_STATIC_DATA);
}
