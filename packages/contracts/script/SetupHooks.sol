// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { entityToAddress, getSystemResourceId } from "src/utils.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { Children, ChildrenTableId } from "codegen/tables/Children.sol";
import { OwnedBy, OwnedByTableId } from "codegen/tables/OwnedBy.sol";
import { Position, PositionTableId, PositionData } from "codegen/tables/Position.sol";
import { MapUtilities, MapUtilitiesTableId } from "codegen/tables/MapUtilities.sol";
import { MapItemUtilities, MapItemUtilitiesTableId } from "codegen/tables/MapItemUtilities.sol";
import { ResourceCount, ResourceCountTableId } from "codegen/tables/ResourceCount.sol";
import { MaxResourceCount, MaxResourceCountTableId } from "codegen/tables/MaxResourceCount.sol";
import { SpawnedTableId } from "codegen/tables/Spawned.sol";
import { ProductionRate, ProductionRateTableId } from "codegen/tables/ProductionRate.sol";
import { UnitCount, UnitCountTableId } from "codegen/tables/UnitCount.sol";
import { LastClaimedAt, LastClaimedAtTableId } from "codegen/tables/LastClaimedAt.sol";
import { QueueItemUnits, QueueItemUnitsTableId } from "codegen/tables/QueueItemUnits.sol";
import { QueueUnits, QueueUnitsTableId } from "codegen/tables/QueueUnits.sol";
import { ProducedResourceTableId } from "codegen/tables/ProducedResource.sol";
import { ProductionRateTableId } from "codegen/tables/ProductionRate.sol";
import { ConsumptionRateTableId } from "codegen/tables/ConsumptionRate.sol";
import { ProducedUnitTableId } from "codegen/tables/ProducedUnit.sol";
import { MapItemStoredUtilitiesTableId } from "codegen/tables/MapItemStoredUtilities.sol";
import { ScoreTableId } from "codegen/tables/Score.sol";
import { AllianceTableId } from "codegen/tables/Alliance.sol";
import { MapItemStoredUtilitiesTableId } from "codegen/tables/MapItemStoredUtilities.sol";
import { ClaimOffsetTableId } from "codegen/tables/ClaimOffset.sol";
import { BattleResultTableId } from "codegen/tables/BattleResult.sol";

import "codegen/index.sol";
import { OnResourceCount_Score } from "src/hooks/storeHooks/OnResourceCount_Score.sol";
import { OnScore_Alliance_Score } from "src/hooks/storeHooks/OnScore_Alliance_Score.sol";

import { OnClaimObjective_Requirements } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_Requirements.sol";
import { OnClaimObjective_ReceiveRewards } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_ReceiveRewards.sol";

import { OnUpgradeUnit_SpendResources } from "src/hooks/systemHooks/upgradeUnit/OnUpgradeUnit_SpendResources.sol";

import { OnUpgradeRange_SpendResources } from "src/hooks/systemHooks/upgradeRange/OnUpgradeRange_SpendResources.sol";

import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";
import { BEFORE_SPLICE_STATIC_DATA, AFTER_SET_RECORD, ALL as STORE_ALL } from "@latticexyz/store/src/storeHookTypes.sol";

function setupHooks(IWorld world) {
  //System Hooks
  registerClaimObjective(world);
  registerUpgradeRangeHook(world);
  registerUpgradeUnitHook(world);

  //Store Hooks
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

/**
 * @dev Registers a system hook for when range is upgraded
 * @param world The World contract instance.
 */
function registerUpgradeRangeHook(IWorld world) {
  ResourceId systemId = getSystemResourceId("UpgradeRangeSystem");

  OnUpgradeRange_SpendResources onUpgradeRange_SpendResources = new OnUpgradeRange_SpendResources();
  console.log("onUpgradeRange_SpendResources address: %s", address(onUpgradeRange_SpendResources));
  address hookAddress = address(onUpgradeRange_SpendResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onUpgradeRange_SpendResources, AFTER_CALL_SYSTEM);
}

/**
 * @dev Registers a system hook for when unit is upgraded
 * @param world The World contract instance.
 */
function registerUpgradeUnitHook(IWorld world) {
  ResourceId systemId = getSystemResourceId("UpgradeUnitSystem");

  OnUpgradeUnit_SpendResources onUpgradeUnit_SpendResources = new OnUpgradeUnit_SpendResources();
  console.log("onUpgradeUnit_SpendResources address: %s", address(onUpgradeUnit_SpendResources));
  address hookAddress = address(onUpgradeUnit_SpendResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onUpgradeUnit_SpendResources, AFTER_CALL_SYSTEM);
}

function registerClaimObjective(IWorld world) {
  ResourceId systemId = getSystemResourceId("ClaimObjectiveSystem");

  OnClaimObjective_Requirements onClaimObjective_Requirements = new OnClaimObjective_Requirements();
  console.log("onClaimObjective_Requirements address: %s", address(onClaimObjective_Requirements));
  world.registerSystemHook(systemId, onClaimObjective_Requirements, BEFORE_CALL_SYSTEM);

  OnClaimObjective_ReceiveRewards onClaimObjective_ReceiveRewards = new OnClaimObjective_ReceiveRewards();
  console.log("onClaimObjective_ReceiveRewards address: %s", address(onClaimObjective_ReceiveRewards));
  address hookAddress = address(onClaimObjective_ReceiveRewards);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(UnitCountTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.registerSystemHook(systemId, onClaimObjective_ReceiveRewards, AFTER_CALL_SYSTEM);
}
