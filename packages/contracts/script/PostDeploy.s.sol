// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { createPrototypes } from "codegen/scripts/CreatePrototypes.sol";
import { createTerrain } from "codegen/scripts/CreateTerrain.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { MirrorSubscriber } from "libraries/MirrorSubscriber.sol";
import { HookedValue, HookedValueTableId } from "codegen/tables/HookedValue.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { Children, ChildrenTableId } from "codegen/tables/Children.sol";
import { OwnedBy, OwnedByTableId } from "codegen/tables/OwnedBy.sol";
import { Position, PositionTableId, PositionData } from "codegen/tables/Position.sol";
import { SetUtilities, SetUtilitiesTableId } from "codegen/tables/SetUtilities.sol";
import { SetItemUtilities, SetItemUtilitiesTableId } from "codegen/tables/SetItemUtilities.sol";
import { ResourceCount, ResourceCountTableId } from "codegen/tables/ResourceCount.sol";
import { MaxResourceCount, MaxResourceCountTableId } from "codegen/tables/MaxResourceCount.sol";
import { SpawnedTableId } from "codegen/tables/Spawned.sol";
import { ProductionRate, ProductionRateTableId } from "codegen/tables/ProductionRate.sol";
import { UnitCount, UnitCountTableId } from "codegen/tables/UnitCount.sol";
import { LastClaimedAt, LastClaimedAtTableId } from "codegen/tables/LastClaimedAt.sol";
import { QueueItemUnits, QueueItemUnitsTableId } from "codegen/tables/QueueItemUnits.sol";
import { QueueUnits, QueueUnitsTableId } from "codegen/tables/QueueUnits.sol";
import { ProductionRateTableId } from "codegen/tables/ProductionRate.sol";
import { OnBuild_PlaceOnTile } from "src/hooks/systemHooks/build/OnBuild_PlaceOnTile.sol";
import { OnBuild_SpendResources } from "src/hooks/systemHooks/build/OnBuild_SpendResources.sol";
import { OnBuild_MaxStorage } from "src/hooks/systemHooks/build/OnBuild_MaxStorage.sol";
import { OnBuild_ProductionRate } from "src/hooks/systemHooks/build/OnBuild_ProductionRate.sol";
import { OnBuild_Requirements } from "src/hooks/systemHooks/build/OnBuild_Requirements.sol";

import { OnUpgrade_Requirements } from "src/hooks/systemHooks/upgrade/OnUpgrade_Requirements.sol";
import { OnUpgrade_ProductionRate } from "src/hooks/systemHooks/upgrade/OnUpgrade_ProductionRate.sol";
import { OnUpgrade_MaxStorage } from "src/hooks/systemHooks/upgrade/OnUpgrade_MaxStorage.sol";
import { OnUpgrade_SpendResources } from "src/hooks/systemHooks/upgrade/OnUpgrade_SpendResources.sol";

import { OnDestroy_ClearUtility } from "src/hooks/systemHooks/destroy/OnDestroy_ClearUtility.sol";
import { OnDestroy_MaxStorage } from "src/hooks/systemHooks/destroy/OnDestroy_MaxStorage.sol";
import { OnDestroy_ProductionRate } from "src/hooks/systemHooks/destroy/OnDestroy_ProductionRate.sol";
import { OnDestroy_Requirements } from "src/hooks/systemHooks/destroy/OnDestroy_Requirements.sol";
import { OnDestroy_RemoveFromTiles } from "src/hooks/systemHooks/destroy/OnDestroy_RemoveFromTiles.sol";

import { OnSendUnits_Requirements } from "src/hooks/systemHooks/sendUnits/OnSendUnits_Requirements.sol";
import { OnSendUnits_UpdateRock } from "src/hooks/systemHooks/sendUnits/OnSendUnits_UpdateRock.sol";
import { OnSendUnits_UnitCount } from "src/hooks/systemHooks/sendUnits/OnSendUnits_UnitCount.sol";

import { OnTrainUnits_SpendResources } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_SpendResources.sol";
import { OnTrainUnits_UpdateRock } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_UpdateRock.sol";
import { OnTrainUnits_Requirements } from "src/hooks/systemHooks/trainUnits/OnTrainUnits_Requirements.sol";

import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    IWorld world = IWorld(worldAddress);
    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    uint256 newValue = world.increment();
    console.log("Increment via IWorld:", newValue);

    createPrototypes(world);
    console.log("Prototypes created");
    createTerrain(world);
    console.log("Terrain created");
    registerBuildHooks(world);
    registerUpgradeHooks(world);
    registerDestroyHooks(world);
    registerSendUnits(world);
    registerTrainUnits(world);
    vm.stopBroadcast();
  }

  function registerBuildHooks(IWorld world) internal {
    OnBuild_Requirements onBuild_Requirements = new OnBuild_Requirements();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_Requirements, BEFORE_CALL_SYSTEM);

    OnBuild_PlaceOnTile onBuild_PlaceOnTile = new OnBuild_PlaceOnTile();
    world.grantAccess(ChildrenTableId, address(onBuild_PlaceOnTile));
    world.grantAccess(OwnedByTableId, address(onBuild_PlaceOnTile));
    world.grantAccess(PositionTableId, address(onBuild_PlaceOnTile));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_PlaceOnTile, AFTER_CALL_SYSTEM);

    OnBuild_SpendResources onBuild_SpendResources = new OnBuild_SpendResources();
    world.grantAccess(ResourceCountTableId, address(onBuild_SpendResources));
    world.grantAccess(SetItemUtilitiesTableId, address(onBuild_SpendResources));
    world.grantAccess(SetUtilitiesTableId, address(onBuild_SpendResources));

    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_SpendResources, AFTER_CALL_SYSTEM);

    OnBuild_MaxStorage onBuild_MaxStorage = new OnBuild_MaxStorage();
    world.grantAccess(ResourceCountTableId, address(onBuild_MaxStorage));
    world.grantAccess(MaxResourceCountTableId, address(onBuild_MaxStorage));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_MaxStorage, AFTER_CALL_SYSTEM);

    OnBuild_ProductionRate onBuild_ProductionRate = new OnBuild_ProductionRate();
    world.grantAccess(ProductionRateTableId, address(onBuild_ProductionRate));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_ProductionRate, AFTER_CALL_SYSTEM);
  }

  function registerUpgradeHooks(IWorld world) internal {
    OnUpgrade_Requirements onUpgrade_Requirements = new OnUpgrade_Requirements();
    world.registerSystemHook(getSystemResourceId("UpgradeBuildingSystem"), onUpgrade_Requirements, BEFORE_CALL_SYSTEM);

    OnUpgrade_ProductionRate onUpgrade_ProductionRate = new OnUpgrade_ProductionRate();
    world.grantAccess(ProductionRateTableId, address(onUpgrade_ProductionRate));
    world.registerSystemHook(getSystemResourceId("UpgradeBuildingSystem"), onUpgrade_ProductionRate, AFTER_CALL_SYSTEM);

    OnUpgrade_MaxStorage onUpgrade_MaxStorage = new OnUpgrade_MaxStorage();
    world.grantAccess(ResourceCountTableId, address(onUpgrade_MaxStorage));
    world.grantAccess(MaxResourceCountTableId, address(onUpgrade_MaxStorage));
    world.registerSystemHook(getSystemResourceId("UpgradeBuildingSystem"), onUpgrade_MaxStorage, AFTER_CALL_SYSTEM);

    OnUpgrade_SpendResources onUpgrade_SpendResources = new OnUpgrade_SpendResources();
    world.grantAccess(ResourceCountTableId, address(onUpgrade_SpendResources));
    world.grantAccess(SetItemUtilitiesTableId, address(onUpgrade_SpendResources));
    world.grantAccess(SetUtilitiesTableId, address(onUpgrade_SpendResources));
    world.registerSystemHook(getSystemResourceId("UpgradeBuildingSystem"), onUpgrade_SpendResources, AFTER_CALL_SYSTEM);
  }

  function registerDestroyHooks(IWorld world) internal {
    OnDestroy_Requirements onDestroy_Requirements = new OnDestroy_Requirements();
    world.registerSystemHook(getSystemResourceId("DestroySystem"), onDestroy_Requirements, BEFORE_CALL_SYSTEM);

    OnDestroy_ClearUtility onDestroy_ClearUtility = new OnDestroy_ClearUtility();
    world.grantAccess(SetItemUtilitiesTableId, address(onDestroy_ClearUtility));
    world.grantAccess(SetUtilitiesTableId, address(onDestroy_ClearUtility));
    world.registerSystemHook(getSystemResourceId("DestroySystem"), onDestroy_ClearUtility, BEFORE_CALL_SYSTEM);

    OnDestroy_MaxStorage onDestroy_MaxStorage = new OnDestroy_MaxStorage();
    world.grantAccess(ResourceCountTableId, address(onDestroy_MaxStorage));
    world.grantAccess(MaxResourceCountTableId, address(onDestroy_MaxStorage));
    world.registerSystemHook(getSystemResourceId("DestroySystem"), onDestroy_MaxStorage, BEFORE_CALL_SYSTEM);

    OnDestroy_ProductionRate onDestroy_ProductionRate = new OnDestroy_ProductionRate();
    world.grantAccess(ProductionRateTableId, address(onDestroy_ProductionRate));
    world.registerSystemHook(getSystemResourceId("DestroySystem"), onDestroy_ProductionRate, BEFORE_CALL_SYSTEM);

    OnDestroy_RemoveFromTiles onDestroy_RemoveFromTiles = new OnDestroy_RemoveFromTiles();
    world.grantAccess(ChildrenTableId, address(onDestroy_RemoveFromTiles));
    world.grantAccess(OwnedByTableId, address(onDestroy_RemoveFromTiles));
    world.registerSystemHook(getSystemResourceId("DestroySystem"), onDestroy_RemoveFromTiles, AFTER_CALL_SYSTEM);
  }

  function registerSendUnits(IWorld world) internal {
    OnSendUnits_Requirements onSendUnits_Requirements = new OnSendUnits_Requirements();
    world.registerSystemHook(getSystemResourceId("SendUnitsSystem"), onSendUnits_Requirements, BEFORE_CALL_SYSTEM);

    OnSendUnits_UnitCount onSendUnits_UnitCount = new OnSendUnits_UnitCount();
    world.grantAccess(UnitCountTableId, address(onSendUnits_UnitCount));
    world.registerSystemHook(getSystemResourceId("SendUnitsSystem"), onSendUnits_UnitCount, BEFORE_CALL_SYSTEM);

    OnSendUnits_UpdateRock onSendUnits_UpdateRock = new OnSendUnits_UpdateRock();
    world.grantAccess(ResourceCountTableId, address(onSendUnits_UpdateRock));
    world.grantAccess(LastClaimedAtTableId, address(onSendUnits_UpdateRock));
    world.grantAccess(QueueItemUnitsTableId, address(onSendUnits_UpdateRock));
    world.grantAccess(QueueUnitsTableId, address(onSendUnits_UpdateRock));
    world.grantAccess(UnitCountTableId, address(onSendUnits_UpdateRock));
    world.grantAccess(ProductionRateTableId, address(onSendUnits_UpdateRock));
    world.registerSystemHook(getSystemResourceId("SendUnitsSystem"), onSendUnits_UpdateRock, AFTER_CALL_SYSTEM);
  }

  function registerTrainUnits(IWorld world) internal {
    OnTrainUnits_Requirements onTrainUnits_Requirements = new OnTrainUnits_Requirements();
    world.registerSystemHook(getSystemResourceId("TrainUnitsSystem"), onTrainUnits_Requirements, BEFORE_CALL_SYSTEM);

    OnTrainUnits_UpdateRock onTrainUnits_UpdateRock = new OnTrainUnits_UpdateRock();

    world.grantAccess(ResourceCountTableId, address(onTrainUnits_UpdateRock));
    world.grantAccess(LastClaimedAtTableId, address(onTrainUnits_UpdateRock));
    world.grantAccess(QueueItemUnitsTableId, address(onTrainUnits_UpdateRock));
    world.grantAccess(QueueUnitsTableId, address(onTrainUnits_UpdateRock));
    world.grantAccess(UnitCountTableId, address(onTrainUnits_UpdateRock));
    world.grantAccess(ProductionRateTableId, address(onTrainUnits_UpdateRock));
    world.registerSystemHook(getSystemResourceId("TrainUnitsSystem"), onTrainUnits_UpdateRock, BEFORE_CALL_SYSTEM);

    OnTrainUnits_SpendResources onTrainUnits_SpendResources = new OnTrainUnits_SpendResources();
    world.grantAccess(ResourceCountTableId, address(onTrainUnits_SpendResources));
    world.grantAccess(SetItemUtilitiesTableId, address(onTrainUnits_SpendResources));
    world.grantAccess(SetUtilitiesTableId, address(onTrainUnits_SpendResources));
    world.registerSystemHook(getSystemResourceId("TrainUnitsSystem"), onTrainUnits_SpendResources, BEFORE_CALL_SYSTEM);
  }
}
