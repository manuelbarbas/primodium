// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
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
import { ProducedUnitTableId } from "codegen/tables/ProducedUnit.sol";
import { OnBefore_ClaimResources } from "src/hooks/systemHooks/OnBefore_ClaimResources.sol";
import { OnBefore_ClaimUnits } from "src/hooks/systemHooks/OnBefore_ClaimUnits.sol";
import { OnBefore_SpendResources } from "src/hooks/systemHooks/OnBefore_SpendResources.sol";

import { OnAfter_MaxStorage } from "src/hooks/systemHooks/OnAfter_MaxStorage.sol";
import { OnAfter_ProductionRate } from "src/hooks/systemHooks/OnAfter_ProductionRate.sol";

import { OnBuild_PlaceOnTile } from "src/hooks/systemHooks/build/OnBuild_PlaceOnTile.sol";
import { OnBuild_Requirements } from "src/hooks/systemHooks/build/OnBuild_Requirements.sol";

import { OnUpgrade_Requirements } from "src/hooks/systemHooks/upgrade/OnUpgrade_Requirements.sol";

import { OnDestroy_ClearUtility } from "src/hooks/systemHooks/destroy/OnDestroy_ClearUtility.sol";
import { OnDestroy_MaxStorage } from "src/hooks/systemHooks/destroy/OnDestroy_MaxStorage.sol";
import { OnDestroy_ProductionRate } from "src/hooks/systemHooks/destroy/OnDestroy_ProductionRate.sol";
import { OnDestroy_Requirements } from "src/hooks/systemHooks/destroy/OnDestroy_Requirements.sol";
import { OnDestroy_RemoveFromTiles } from "src/hooks/systemHooks/destroy/OnDestroy_RemoveFromTiles.sol";

import { OnSendUnits_Requirements } from "src/hooks/systemHooks/sendUnits/OnSendUnits_Requirements.sol";
import { OnSendUnits_UnitCount } from "src/hooks/systemHooks/sendUnits/OnSendUnits_UnitCount.sol";

import { OnTrainUnits_Requirements } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_Requirements.sol";

import { OnInvade_TargetClaimResourcesAndUnits } from "src/hooks/systemHooks/invade/OnInvade_TargetClaimResourcesAndUnits.sol";
import { OnInvade_Requirements } from "src/hooks/systemHooks/invade/OnInvade_Requirements.sol";

import { OnRaid_TargetClaimResourcesAndUnits } from "src/hooks/systemHooks/raid/OnRaid_TargetClaimResourcesAndUnits.sol";
import { OnRaid_Requirements } from "src/hooks/systemHooks/raid/OnRaid_Requirements.sol";

import { OnReinforce_TargetClaimResources } from "src/hooks/systemHooks/reinforce/OnReinforce_TargetClaimResources.sol";

import { OnClaimObjective_Requirements } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_Requirements.sol";
import { OnClaimObjective_ReceiveRewards } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_ReceiveRewards.sol";

import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

function setupHooks(IWorld world) {
  OnBefore_ClaimResources onBefore_ClaimResources = new OnBefore_ClaimResources();
  world.grantAccess(ResourceCountTableId, address(onBefore_ClaimResources));
  world.grantAccess(MapItemUtilitiesTableId, address(onBefore_ClaimResources));
  world.grantAccess(MapUtilitiesTableId, address(onBefore_ClaimResources));
  world.grantAccess(LastClaimedAtTableId, address(onBefore_ClaimResources));
  world.grantAccess(ProducedResourceTableId, address(onBefore_ClaimResources));

  OnBefore_ClaimUnits onBefore_ClaimUnits = new OnBefore_ClaimUnits();
  world.grantAccess(UnitCountTableId, address(onBefore_ClaimUnits));
  world.grantAccess(LastClaimedAtTableId, address(onBefore_ClaimUnits));
  world.grantAccess(QueueItemUnitsTableId, address(onBefore_ClaimUnits));
  world.grantAccess(QueueUnitsTableId, address(onBefore_ClaimUnits));
  world.grantAccess(ProducedUnitTableId, address(onBefore_ClaimUnits));

  OnBefore_SpendResources onBefore_SpendResources = new OnBefore_SpendResources();
  world.grantAccess(ResourceCountTableId, address(onBefore_SpendResources));
  world.grantAccess(MapItemUtilitiesTableId, address(onBefore_SpendResources));
  world.grantAccess(MapUtilitiesTableId, address(onBefore_SpendResources));
  world.grantAccess(MaxResourceCountTableId, address(onBefore_SpendResources));

  OnAfter_MaxStorage onAfter_MaxStorage = new OnAfter_MaxStorage();
  world.grantAccess(ResourceCountTableId, address(onAfter_MaxStorage));
  world.grantAccess(MaxResourceCountTableId, address(onAfter_MaxStorage));

  OnAfter_ProductionRate onAfter_ProductionRate = new OnAfter_ProductionRate();
  world.grantAccess(ProductionRateTableId, address(onAfter_ProductionRate));
  world.grantAccess(MaxResourceCountTableId, address(onAfter_ProductionRate));
  world.grantAccess(ResourceCountTableId, address(onAfter_ProductionRate));

  registerBuildHooks(
    world,
    onBefore_ClaimResources,
    onBefore_SpendResources,
    onAfter_MaxStorage,
    onAfter_ProductionRate
  );
  registerUpgradeHooks(
    world,
    onBefore_ClaimResources,
    onBefore_SpendResources,
    onAfter_MaxStorage,
    onAfter_ProductionRate
  );
  registerDestroyHooks(world, onBefore_ClaimResources);
  registerSendUnits(world, onBefore_ClaimUnits);
  registerTrainUnits(world, onBefore_ClaimResources, onBefore_ClaimUnits, onBefore_SpendResources);
  registerInvade(world, onBefore_ClaimResources, onBefore_ClaimUnits);
  registerRaid(world, onBefore_ClaimResources, onBefore_ClaimUnits);
  registerReinforce(world, onBefore_ClaimUnits);
  registerClaimObjective(world, onBefore_ClaimResources, onBefore_ClaimUnits);
}

/**
 * @dev Register system hooks for the build actions.
 * @param world The World contract instance.
 */
function registerBuildHooks(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_SpendResources onBefore_SpendResources,
  OnAfter_MaxStorage onAfter_MaxStorage,
  OnAfter_ProductionRate onAfter_ProductionRate
) {
  ResourceId systemId = getSystemResourceId("BuildSystem");
  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  OnBuild_Requirements onBuild_Requirements = new OnBuild_Requirements();
  world.registerSystemHook(systemId, onBuild_Requirements, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_SpendResources, AFTER_CALL_SYSTEM);

  OnBuild_PlaceOnTile onBuild_PlaceOnTile = new OnBuild_PlaceOnTile();
  world.grantAccess(ChildrenTableId, address(onBuild_PlaceOnTile));
  world.grantAccess(OwnedByTableId, address(onBuild_PlaceOnTile));
  world.grantAccess(PositionTableId, address(onBuild_PlaceOnTile));
  world.registerSystemHook(systemId, onBuild_PlaceOnTile, AFTER_CALL_SYSTEM);

  world.registerSystemHook(systemId, onAfter_MaxStorage, AFTER_CALL_SYSTEM);

  world.registerSystemHook(systemId, onAfter_ProductionRate, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for the upgrade actions.
 * @param world The World contract instance.
 */
function registerUpgradeHooks(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_SpendResources onBefore_SpendResources,
  OnAfter_MaxStorage onAfter_MaxStorage,
  OnAfter_ProductionRate onAfter_ProductionRate
) {
  ResourceId systemId = getSystemResourceId("UpgradeBuildingSystem");
  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  OnUpgrade_Requirements onUpgrade_Requirements = new OnUpgrade_Requirements();
  world.registerSystemHook(systemId, onUpgrade_Requirements, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_SpendResources, AFTER_CALL_SYSTEM);

  world.registerSystemHook(systemId, onAfter_MaxStorage, AFTER_CALL_SYSTEM);

  world.registerSystemHook(systemId, onAfter_ProductionRate, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for the destroy actions.
 * @param world The World contract instance.
 */
function registerDestroyHooks(IWorld world, OnBefore_ClaimResources onBefore_ClaimResources) {
  ResourceId systemId = getSystemResourceId("DestroySystem");
  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  OnDestroy_Requirements onDestroy_Requirements = new OnDestroy_Requirements();
  world.registerSystemHook(systemId, onDestroy_Requirements, BEFORE_CALL_SYSTEM);

  OnDestroy_ClearUtility onDestroy_ClearUtility = new OnDestroy_ClearUtility();
  world.grantAccess(MapItemUtilitiesTableId, address(onDestroy_ClearUtility));
  world.grantAccess(MapUtilitiesTableId, address(onDestroy_ClearUtility));
  world.grantAccess(MaxResourceCountTableId, address(onDestroy_ClearUtility));
  world.grantAccess(ResourceCountTableId, address(onDestroy_ClearUtility));
  world.registerSystemHook(systemId, onDestroy_ClearUtility, BEFORE_CALL_SYSTEM);

  OnDestroy_MaxStorage onDestroy_MaxStorage = new OnDestroy_MaxStorage();
  world.grantAccess(ResourceCountTableId, address(onDestroy_MaxStorage));
  world.grantAccess(MaxResourceCountTableId, address(onDestroy_MaxStorage));
  world.registerSystemHook(systemId, onDestroy_MaxStorage, BEFORE_CALL_SYSTEM);

  OnDestroy_ProductionRate onDestroy_ProductionRate = new OnDestroy_ProductionRate();
  world.grantAccess(ProductionRateTableId, address(onDestroy_ProductionRate));
  world.grantAccess(MaxResourceCountTableId, address(onDestroy_ProductionRate));
  world.grantAccess(ResourceCountTableId, address(onDestroy_ProductionRate));
  world.registerSystemHook(systemId, onDestroy_ProductionRate, BEFORE_CALL_SYSTEM);

  OnDestroy_RemoveFromTiles onDestroy_RemoveFromTiles = new OnDestroy_RemoveFromTiles();
  world.grantAccess(ChildrenTableId, address(onDestroy_RemoveFromTiles));
  world.grantAccess(OwnedByTableId, address(onDestroy_RemoveFromTiles));
  world.registerSystemHook(systemId, onDestroy_RemoveFromTiles, AFTER_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for sending units.
 * @param world The World contract instance.
 */
function registerSendUnits(IWorld world, OnBefore_ClaimUnits onBefore_ClaimUnits) {
  ResourceId systemId = getSystemResourceId("SendUnitsSystem");

  OnSendUnits_Requirements onSendUnits_Requirements = new OnSendUnits_Requirements();
  world.registerSystemHook(systemId, onSendUnits_Requirements, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  OnSendUnits_UnitCount onSendUnits_UnitCount = new OnSendUnits_UnitCount();
  world.grantAccess(UnitCountTableId, address(onSendUnits_UnitCount));
  world.registerSystemHook(systemId, onSendUnits_UnitCount, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for training units.
 * @param world The World contract instance.
 */
function registerTrainUnits(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_ClaimUnits onBefore_ClaimUnits,
  OnBefore_SpendResources onBefore_SpendResources
) {
  ResourceId systemId = getSystemResourceId("TrainUnitsSystem");

  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_SpendResources, BEFORE_CALL_SYSTEM);

  OnTrainUnits_Requirements onTrainUnits_Requirements = new OnTrainUnits_Requirements();
  world.registerSystemHook(systemId, onTrainUnits_Requirements, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for invading actions.
 * @param world The World contract instance.
 */
function registerInvade(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_ClaimUnits onBefore_ClaimUnits
) {
  ResourceId systemId = getSystemResourceId("InvadeSystem");

  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  OnInvade_Requirements onInvade_Requirements = new OnInvade_Requirements();
  world.registerSystemHook(systemId, onInvade_Requirements, BEFORE_CALL_SYSTEM);

  OnInvade_TargetClaimResourcesAndUnits onInvade_TargetClaimResourcesAndUnits = new OnInvade_TargetClaimResourcesAndUnits();
  world.grantAccess(ResourceCountTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(LastClaimedAtTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(QueueItemUnitsTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(QueueUnitsTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(UnitCountTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(ProductionRateTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(ProducedResourceTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.grantAccess(ProducedUnitTableId, address(onInvade_TargetClaimResourcesAndUnits));
  world.registerSystemHook(systemId, onInvade_TargetClaimResourcesAndUnits, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for raid actions.
 * @param world The World contract instance.
 */
function registerRaid(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_ClaimUnits onBefore_ClaimUnits
) {
  ResourceId systemId = getSystemResourceId("RaidSystem");

  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  OnRaid_Requirements onRaid_Requirements = new OnRaid_Requirements();
  world.registerSystemHook(systemId, onRaid_Requirements, BEFORE_CALL_SYSTEM);

  OnRaid_TargetClaimResourcesAndUnits onRaid_TargetClaimResourcesAndUnits = new OnRaid_TargetClaimResourcesAndUnits();
  world.grantAccess(ResourceCountTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(LastClaimedAtTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(QueueItemUnitsTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(QueueUnitsTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(UnitCountTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(ProductionRateTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(ProducedResourceTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.grantAccess(ProducedUnitTableId, address(onRaid_TargetClaimResourcesAndUnits));
  world.registerSystemHook(systemId, onRaid_TargetClaimResourcesAndUnits, BEFORE_CALL_SYSTEM);
}

/**
 * @dev Register system hooks for reinforcing actions.
 * @param world The World contract instance.
 */
function registerReinforce(IWorld world, OnBefore_ClaimUnits onBefore_ClaimUnits) {
  ResourceId systemId = getSystemResourceId("ReinforceSystem");

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  OnReinforce_TargetClaimResources onReinforce_TargetClaimResources = new OnReinforce_TargetClaimResources();
  world.grantAccess(ResourceCountTableId, address(onReinforce_TargetClaimResources));
  world.grantAccess(LastClaimedAtTableId, address(onReinforce_TargetClaimResources));
  world.grantAccess(ProductionRateTableId, address(onReinforce_TargetClaimResources));
  world.grantAccess(ProducedResourceTableId, address(onReinforce_TargetClaimResources));
  world.registerSystemHook(systemId, onReinforce_TargetClaimResources, BEFORE_CALL_SYSTEM);
}

function registerClaimObjective(
  IWorld world,
  OnBefore_ClaimResources onBefore_ClaimResources,
  OnBefore_ClaimUnits onBefore_ClaimUnits
) {
  ResourceId systemId = getSystemResourceId("ClaimObjectiveSystem");

  world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);

  world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);

  OnClaimObjective_Requirements onClaimObjective_Requirements = new OnClaimObjective_Requirements();
  world.registerSystemHook(systemId, onClaimObjective_Requirements, BEFORE_CALL_SYSTEM);

  OnClaimObjective_ReceiveRewards onClaimObjective_ReceiveRewards = new OnClaimObjective_ReceiveRewards();
  world.grantAccess(ResourceCountTableId, address(onClaimObjective_ReceiveRewards));
  world.grantAccess(MapItemUtilitiesTableId, address(onClaimObjective_ReceiveRewards));
  world.grantAccess(MapUtilitiesTableId, address(onClaimObjective_ReceiveRewards));
  world.grantAccess(UnitCountTableId, address(onClaimObjective_ReceiveRewards));
  world.grantAccess(ProducedResourceTableId, address(onClaimObjective_ReceiveRewards));
  world.registerSystemHook(systemId, onClaimObjective_ReceiveRewards, AFTER_CALL_SYSTEM);
}
