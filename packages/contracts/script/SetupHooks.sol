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

import { OnBuild_PlaceOnTile } from "src/hooks/systemHooks/build/OnBuild_PlaceOnTile.sol";
import { OnBuild_Requirements } from "src/hooks/systemHooks/build/OnBuild_Requirements.sol";
import { OnBuild_SpendResources } from "src/hooks/systemHooks/build/OnBuild_SpendResources.sol";
import { OnBuild_MaxStorage } from "src/hooks/systemHooks/build/OnBuild_MaxStorage.sol";
import { OnBuild_ProductionRate } from "src/hooks/systemHooks/build/OnBuild_ProductionRate.sol";

import { OnUpgrade_Requirements } from "src/hooks/systemHooks/upgrade/OnUpgrade_Requirements.sol";
import { OnUpgrade_SpendResources } from "src/hooks/systemHooks/upgrade/OnUpgrade_SpendResources.sol";
import { OnUpgrade_MaxStorage } from "src/hooks/systemHooks/upgrade/OnUpgrade_MaxStorage.sol";
import { OnUpgrade_ProductionRate } from "src/hooks/systemHooks/upgrade/OnUpgrade_ProductionRate.sol";

import { OnDestroy_ClearUtility } from "src/hooks/systemHooks/destroy/OnDestroy_ClearUtility.sol";
import { OnDestroy_MaxStorage } from "src/hooks/systemHooks/destroy/OnDestroy_MaxStorage.sol";
import { OnDestroy_ProductionRate } from "src/hooks/systemHooks/destroy/OnDestroy_ProductionRate.sol";
import { OnDestroy_Requirements } from "src/hooks/systemHooks/destroy/OnDestroy_Requirements.sol";
import { OnDestroy_RemoveFromTiles } from "src/hooks/systemHooks/destroy/OnDestroy_RemoveFromTiles.sol";

import { OnSendUnits_Requirements } from "src/hooks/systemHooks/sendUnits/OnSendUnits_Requirements.sol";
import { OnSendUnits_UnitCount } from "src/hooks/systemHooks/sendUnits/OnSendUnits_UnitCount.sol";

import { OnTrainUnits_Requirements } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_Requirements.sol";
import { OnTrainUnits_SpendResources } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_SpendResources.sol";

import { OnInvade_TargetClaimResourcesAndUnits } from "src/hooks/systemHooks/invade/OnInvade_TargetClaimResourcesAndUnits.sol";
import { OnInvade_Requirements } from "src/hooks/systemHooks/invade/OnInvade_Requirements.sol";

import { OnRaid_TargetClaimResourcesAndUnits } from "src/hooks/systemHooks/raid/OnRaid_TargetClaimResourcesAndUnits.sol";
import { OnRaid_Requirements } from "src/hooks/systemHooks/raid/OnRaid_Requirements.sol";

import { OnReinforce_TargetClaimResources } from "src/hooks/systemHooks/reinforce/OnReinforce_TargetClaimResources.sol";

import { OnClaimObjective_Requirements } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_Requirements.sol";
import { OnClaimObjective_ReceiveRewards } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_ReceiveRewards.sol";

import { OnUpgradeUnit_SpendResources } from "src/hooks/systemHooks/upgradeUnit/OnUpgradeUnit_SpendResources.sol";

import { OnUpgradeRange_SpendResources } from "src/hooks/systemHooks/upgradeRange/OnUpgradeRange_SpendResources.sol";

import { OnAlliance_TargetClaimResources } from "src/hooks/systemHooks/alliance/OnAlliance_TargetClaimResources.sol";

import { OnRecall_TargetClaimResources } from "src/hooks/systemHooks/recall/OnRecall_TargetClaimResources.sol";

import { OnToggleBuilding_MaxStorage } from "src/hooks/systemHooks/toggleBuilding/OnToggleBuilding_MaxStorage.sol";
import { OnToggleBuilding_ProductionRate } from "src/hooks/systemHooks/toggleBuilding/OnToggleBuilding_ProductionRate.sol";
import { OnToggleBuilding_Utility } from "src/hooks/systemHooks/toggleBuilding/OnToggleBuilding_Utility.sol";

import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";
import { BEFORE_SPLICE_STATIC_DATA, AFTER_SET_RECORD, ALL as STORE_ALL } from "@latticexyz/store/src/storeHookTypes.sol";

function setupHooks(IWorld world) {
  //System Hooks
  registerBuildHooks(world);
  registerUpgradeHooks(world);
  registerDestroyHooks(world);
  registerSendUnits(world);
  registerTrainUnits(world);
  registerInvade(world);
  registerRaid(world);
  registerReinforce(world);
  registerClaimObjective(world);
  registerUpgradeRangeHook(world);
  registerUpgradeUnitHook(world);

  registerAllianceHooks(world);
  registerRecallHooks(world);
  registerToggleBuildingHooks(world);
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

function registerToggleBuildingHooks(IWorld world) {
  ResourceId systemId = getSystemResourceId("ToggleBuildingSystem");

  OnToggleBuilding_MaxStorage onToggleBuilding_MaxStorage = new OnToggleBuilding_MaxStorage();
  console.log("onToggleBuilding_MaxStorage address: %s", address(onToggleBuilding_MaxStorage));
  address hookAddress = address(onToggleBuilding_MaxStorage);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onToggleBuilding_MaxStorage, AFTER_CALL_SYSTEM);

  OnToggleBuilding_ProductionRate onToggleBuilding_ProductionRate = new OnToggleBuilding_ProductionRate();
  console.log("onToggleBuilding_ProductionRate address: %s", address(onToggleBuilding_ProductionRate));
  hookAddress = address(onToggleBuilding_ProductionRate);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(ConsumptionRateTableId, hookAddress);
  world.registerSystemHook(systemId, onToggleBuilding_ProductionRate, AFTER_CALL_SYSTEM);

  OnToggleBuilding_Utility onToggleBuilding_Utility = new OnToggleBuilding_Utility();
  console.log("onToggleBuilding_Utility address: %s", address(onToggleBuilding_Utility));
  hookAddress = address(onToggleBuilding_Utility);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onToggleBuilding_Utility, AFTER_CALL_SYSTEM);
}

function registerAllianceHooks(IWorld world, OnBefore_ClaimResources onBefore_ClaimResources) {
  OnAlliance_TargetClaimResources onAlliance_TargetClaimResources = new OnAlliance_TargetClaimResources();
  console.log("onAlliance_TargetClaimResources address: %s", address(onAlliance_TargetClaimResources));
  address hookAddress = address(onAlliance_TargetClaimResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(LastClaimedAtTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.registerSystemHook(getSystemResourceId("AllianceSystem"), onAlliance_TargetClaimResources, BEFORE_CALL_SYSTEM);
}

function registerRecallHooks(IWorld world) {
  OnRecall_TargetClaimResources onRecall_TargetClaimResources = new OnRecall_TargetClaimResources();
  console.log("onRecall_TargetClaimResources address: %s", address(onRecall_TargetClaimResources));
  address hookAddress = address(onRecall_TargetClaimResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(LastClaimedAtTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.registerSystemHook(getSystemResourceId("RecallSystem"), onRecall_TargetClaimResources, BEFORE_CALL_SYSTEM);
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

/**
 * @dev Register system hooks for the build actions.
 * @param world The World contract instance.
 */
function registerBuildHooks(IWorld world) {
  ResourceId systemId = getSystemResourceId("BuildSystem");

  OnBuild_Requirements onBuild_Requirements = new OnBuild_Requirements();
  console.log("onBuild_Requirements address: %s", address(onBuild_Requirements));
  world.registerSystemHook(systemId, onBuild_Requirements, BEFORE_CALL_SYSTEM);

  OnBuild_SpendResources onBuild_SpendResources = new OnBuild_SpendResources();
  console.log("onBuild_SpendResources address: %s", address(onBuild_SpendResources));
  address hookAddress = address(onBuild_SpendResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onBuild_SpendResources, AFTER_CALL_SYSTEM);

  OnBuild_PlaceOnTile onBuild_PlaceOnTile = new OnBuild_PlaceOnTile();
  console.log("onBuild_PlaceOnTile address: %s", address(onBuild_PlaceOnTile));
  hookAddress = address(onBuild_PlaceOnTile);
  world.grantAccess(ChildrenTableId, hookAddress);
  world.grantAccess(OwnedByTableId, hookAddress);
  world.grantAccess(PositionTableId, hookAddress);
  world.registerSystemHook(systemId, onBuild_PlaceOnTile, AFTER_CALL_SYSTEM);

  OnBuild_MaxStorage onBuild_MaxStorage = new OnBuild_MaxStorage();
  console.log("onBuild_MaxStorage address: %s", address(onBuild_MaxStorage));
  hookAddress = address(onBuild_MaxStorage);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onBuild_MaxStorage, AFTER_CALL_SYSTEM);

  OnBuild_ProductionRate onBuild_ProductionRate = new OnBuild_ProductionRate();
  console.log("onBuild_ProductionRate address: %s", address(onBuild_ProductionRate));
  hookAddress = address(onBuild_ProductionRate);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(ConsumptionRateTableId, hookAddress);

  world.registerSystemHook(systemId, onBuild_ProductionRate, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for the upgrade actions.
 * @param world The World contract instance.
 */
function registerUpgradeHooks(IWorld world) {
  ResourceId systemId = getSystemResourceId("UpgradeBuildingSystem");

  OnUpgrade_Requirements onUpgrade_Requirements = new OnUpgrade_Requirements();
  console.log("onUpgrade_Requirements address: %s", address(onUpgrade_Requirements));
  world.registerSystemHook(systemId, onUpgrade_Requirements, BEFORE_CALL_SYSTEM);

  OnUpgrade_SpendResources onUpgrade_SpendResources = new OnUpgrade_SpendResources();
  console.log("onUpgrade_SpendResources address: %s", address(onUpgrade_SpendResources));
  address hookAddress = address(onUpgrade_SpendResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onUpgrade_SpendResources, AFTER_CALL_SYSTEM);

  OnUpgrade_MaxStorage onUpgrade_MaxStorage = new OnUpgrade_MaxStorage();
  console.log("onUpgrade_MaxStorage address: %s", address(onUpgrade_MaxStorage));
  hookAddress = address(onUpgrade_MaxStorage);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onUpgrade_MaxStorage, AFTER_CALL_SYSTEM);

  OnUpgrade_ProductionRate onUpgrade_ProductionRate = new OnUpgrade_ProductionRate();
  console.log("onUpgrade_ProductionRate address: %s", address(onUpgrade_ProductionRate));
  hookAddress = address(onUpgrade_ProductionRate);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(ConsumptionRateTableId, hookAddress);
  world.registerSystemHook(systemId, onUpgrade_ProductionRate, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for the destroy actions.
 * @param world The World contract instance.
 */
function registerDestroyHooks(IWorld world) {
  ResourceId systemId = getSystemResourceId("DestroySystem");

  OnDestroy_Requirements onDestroy_Requirements = new OnDestroy_Requirements();
  console.log("onDestroy_Requirements address: %s", address(onDestroy_Requirements));
  world.registerSystemHook(systemId, onDestroy_Requirements, BEFORE_CALL_SYSTEM);

  OnDestroy_ClearUtility onDestroy_ClearUtility = new OnDestroy_ClearUtility();
  console.log("onDestroy_ClearUtility address: %s", address(onDestroy_ClearUtility));
  address hookAddress = address(onDestroy_ClearUtility);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onDestroy_ClearUtility, BEFORE_CALL_SYSTEM);

  OnDestroy_MaxStorage onDestroy_MaxStorage = new OnDestroy_MaxStorage();
  console.log("onDestroy_MaxStorage address: %s", address(onDestroy_MaxStorage));

  hookAddress = address(onDestroy_MaxStorage);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onDestroy_MaxStorage, BEFORE_CALL_SYSTEM);

  OnDestroy_ProductionRate onDestroy_ProductionRate = new OnDestroy_ProductionRate();
  console.log("onDestroy_ProductionRate address: %s", address(onDestroy_ProductionRate));
  hookAddress = address(onDestroy_ProductionRate);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(ConsumptionRateTableId, hookAddress);
  world.registerSystemHook(systemId, onDestroy_ProductionRate, BEFORE_CALL_SYSTEM);

  OnDestroy_RemoveFromTiles onDestroy_RemoveFromTiles = new OnDestroy_RemoveFromTiles();
  console.log("onDestroy_RemoveFromTiles address: %s", address(onDestroy_RemoveFromTiles));
  hookAddress = address(onDestroy_RemoveFromTiles);
  world.grantAccess(ChildrenTableId, hookAddress);
  world.grantAccess(OwnedByTableId, hookAddress);
  world.registerSystemHook(systemId, onDestroy_RemoveFromTiles, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for sending units.
 * @param world The World contract instance.
 */
function registerSendUnits(IWorld world) {
  ResourceId systemId = getSystemResourceId("SendUnitsSystem");

  OnSendUnits_Requirements onSendUnits_Requirements = new OnSendUnits_Requirements();
  console.log("onSendUnits_Requirements address: %s", address(onSendUnits_Requirements));
  world.registerSystemHook(systemId, onSendUnits_Requirements, BEFORE_CALL_SYSTEM);

  OnSendUnits_UnitCount onSendUnits_UnitCount = new OnSendUnits_UnitCount();
  console.log("onSendUnits_UnitCount address: %s", address(onSendUnits_UnitCount));
  world.grantAccess(UnitCountTableId, address(onSendUnits_UnitCount));
  world.registerSystemHook(systemId, onSendUnits_UnitCount, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for training units.
 * @param world The World contract instance.
 */
function registerTrainUnits(IWorld world) {
  ResourceId systemId = getSystemResourceId("TrainUnitsSystem");

  OnTrainUnits_SpendResources onTrainUnits_SpendResources = new OnTrainUnits_SpendResources();
  console.log("onTrainUnits_SpendResources address: %s", address(onTrainUnits_SpendResources));
  address hookAddress = address(onTrainUnits_SpendResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(MapItemUtilitiesTableId, hookAddress);
  world.grantAccess(MapUtilitiesTableId, hookAddress);
  world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
  world.grantAccess(MaxResourceCountTableId, hookAddress);
  world.registerSystemHook(systemId, onTrainUnits_SpendResources, BEFORE_CALL_SYSTEM);

  OnTrainUnits_Requirements onTrainUnits_Requirements = new OnTrainUnits_Requirements();
  console.log("onTrainUnits_Requirements address: %s", address(onTrainUnits_Requirements));
  world.registerSystemHook(systemId, onTrainUnits_Requirements, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for invading actions.
 * @param world The World contract instance.
 */
function registerInvade(IWorld world) {
  ResourceId systemId = getSystemResourceId("InvadeSystem");

  OnInvade_Requirements onInvade_Requirements = new OnInvade_Requirements();
  console.log("onInvade_Requirements address: %s", address(onInvade_Requirements));
  world.registerSystemHook(systemId, onInvade_Requirements, BEFORE_CALL_SYSTEM);

  OnInvade_TargetClaimResourcesAndUnits onInvade_TargetClaimResourcesAndUnits = new OnInvade_TargetClaimResourcesAndUnits();
  console.log("onInvade_TargetClaimResourcesAndUnits address: %s", address(onInvade_TargetClaimResourcesAndUnits));
  address hookAddress = address(onInvade_TargetClaimResourcesAndUnits);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(LastClaimedAtTableId, hookAddress);
  world.grantAccess(ClaimOffsetTableId, hookAddress);
  world.grantAccess(QueueItemUnitsTableId, hookAddress);
  world.grantAccess(QueueUnitsTableId, hookAddress);
  world.grantAccess(UnitCountTableId, hookAddress);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.grantAccess(ProducedUnitTableId, hookAddress);
  world.registerSystemHook(systemId, onInvade_TargetClaimResourcesAndUnits, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for raid actions.
 * @param world The World contract instance.
 */
function registerRaid(IWorld world) {
  ResourceId systemId = getSystemResourceId("RaidSystem");

  OnRaid_Requirements onRaid_Requirements = new OnRaid_Requirements();
  console.log("onRaid_Requirements address: %s", address(onRaid_Requirements));
  world.registerSystemHook(systemId, onRaid_Requirements, BEFORE_CALL_SYSTEM);

  OnRaid_TargetClaimResourcesAndUnits onRaid_TargetClaimResourcesAndUnits = new OnRaid_TargetClaimResourcesAndUnits();
  console.log("onRaid_TargetClaimResourcesAndUnits address: %s", address(onRaid_TargetClaimResourcesAndUnits));
  address hookAddress = address(onRaid_TargetClaimResourcesAndUnits);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(LastClaimedAtTableId, hookAddress);
  world.grantAccess(ClaimOffsetTableId, hookAddress);
  world.grantAccess(QueueItemUnitsTableId, hookAddress);
  world.grantAccess(QueueUnitsTableId, hookAddress);
  world.grantAccess(UnitCountTableId, hookAddress);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.grantAccess(ProducedUnitTableId, hookAddress);
  world.registerSystemHook(systemId, onRaid_TargetClaimResourcesAndUnits, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for reinforcing actions.
 * @param world The World contract instance.
 */
function registerReinforce(IWorld world) {
  ResourceId systemId = getSystemResourceId("ReinforceSystem");

  OnReinforce_TargetClaimResources onReinforce_TargetClaimResources = new OnReinforce_TargetClaimResources();
  console.log("onReinforce_TargetClaimResources address: %s", address(onReinforce_TargetClaimResources));
  address hookAddress = address(onReinforce_TargetClaimResources);
  world.grantAccess(ResourceCountTableId, hookAddress);
  world.grantAccess(LastClaimedAtTableId, hookAddress);
  world.grantAccess(ClaimOffsetTableId, hookAddress);
  world.grantAccess(ProductionRateTableId, hookAddress);
  world.grantAccess(ProducedResourceTableId, hookAddress);
  world.registerSystemHook(systemId, onReinforce_TargetClaimResources, BEFORE_CALL_SYSTEM);
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
