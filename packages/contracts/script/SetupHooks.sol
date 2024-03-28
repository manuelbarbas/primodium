// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console } from "forge-std/console.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { OwnedBy, Score, AllianceScoreContribution, Alliance, ResourceCount } from "codegen/index.sol";
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
  OnScore_Alliance_Score onScore_Alliance_Score = new OnScore_Alliance_Score();
  console.log("onScore_Alliance_Score address: %s", address(onScore_Alliance_Score));
  world.grantAccess(Score._tableId, address(onScore_Alliance_Score));
  world.grantAccess(AllianceScoreContribution._tableId, address(onScore_Alliance_Score));
  world.registerStoreHook(Score._tableId, onScore_Alliance_Score, BEFORE_SPLICE_STATIC_DATA);
}
