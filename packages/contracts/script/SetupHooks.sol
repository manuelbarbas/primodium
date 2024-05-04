// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console } from "forge-std/console.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { OwnedBy, Points, AlliancePointContribution, Alliance, ResourceCount } from "codegen/index.sol";
import { OnPoints_Alliance_Points } from "src/hooks/storeHooks/OnPoints_Alliance_Points.sol";
import { BEFORE_SPLICE_STATIC_DATA } from "@latticexyz/store/src/storeHookTypes.sol";

function setupHooks(IWorld world) {
  registerPointsHook(world);
}

/**
 * @dev Registers a store hook for between ResourceCount and the Points tables.
 * @param world The World contract instance.
 */
function registerPointsHook(IWorld world) {
  OnPoints_Alliance_Points onPoints_Alliance_Points = new OnPoints_Alliance_Points();
  console.log("onPoints_Alliance_Points address: %s", address(onPoints_Alliance_Points));
  world.grantAccess(Points._tableId, address(onPoints_Alliance_Points));
  world.grantAccess(AlliancePointContribution._tableId, address(onPoints_Alliance_Points));
  world.registerStoreHook(Points._tableId, onPoints_Alliance_Points, BEFORE_SPLICE_STATIC_DATA);
}
