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
import { BuildOrder, BuildOrderTableId, BuildOrderData } from "codegen/tables/BuildOrder.sol";
import { SetUtilities, SetUtilitiesTableId } from "codegen/tables/SetUtilities.sol";
import { SetItemUtilities, SetItemUtilitiesTableId } from "codegen/tables/SetItemUtilities.sol";
import { ResourceCount, ResourceCountTableId } from "codegen/tables/ResourceCount.sol";
import { MaxResourceCount, MaxResourceCountTableId } from "codegen/tables/MaxResourceCount.sol";
import { SpawnedTableId } from "codegen/tables/Spawned.sol";
import { ProductionRate, ProductionRateTableId } from "codegen/tables/ProductionRate.sol";
import { OnBuild_PlaceOnTile } from "src/hooks/systemHooks/build/OnBuild_PlaceOnTile.sol";
import { OnBuild_Spawn } from "src/hooks/systemHooks/build/OnBuild_Spawn.sol";
import { OnBuild_Home } from "src/hooks/systemHooks/build/OnBuild_Home.sol";
import { OnBuild_MainBaseLevel } from "src/hooks/systemHooks/build/OnBuild_MainBaseLevel.sol";
import { OnBuild_MainBase } from "src/hooks/systemHooks/build/OnBuild_MainBase.sol";
import { OnBuild_BuildingType } from "src/hooks/systemHooks/build/OnBuild_BuildingType.sol";
import { OnBuild_PlayerSpawned } from "src/hooks/systemHooks/build/OnBuild_PlayerSpawned.sol";
import { OnBuild_SpendResources } from "src/hooks/systemHooks/build/OnBuild_SpendResources.sol";
import { OnBuild_MaxStorage } from "src/hooks/systemHooks/build/OnBuild_MaxStorage.sol";
import { OnBuild_ProductionRate } from "src/hooks/systemHooks/build/OnBuild_ProductionRate.sol";

import { ALL } from "@latticexyz/world/src/systemHookTypes.sol";

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
    //OnSpawn_BuildMainBase buildMainBase = new OnSpawn_BuildMainBase();
    registerBuildHooks(world);
    vm.stopBroadcast();
  }

  function registerBuildHooks(IWorld world) internal {
    OnBuild_PlayerSpawned onBuild_PlayerSpawned = new OnBuild_PlayerSpawned();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_PlayerSpawned, ALL);

    OnBuild_Home onBuild_Home = new OnBuild_Home();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_Home, ALL);

    OnBuild_MainBase onBuild_MainBase = new OnBuild_MainBase();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_MainBase, ALL);

    OnBuild_BuildingType onBuild_BuildingType = new OnBuild_BuildingType();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_BuildingType, ALL);

    OnBuild_Spawn onBuild_Spawn = new OnBuild_Spawn();
    world.grantAccess(SpawnedTableId, address(onBuild_Spawn));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_Spawn, ALL);

    OnBuild_MainBaseLevel onBuild_MainBaseLevel = new OnBuild_MainBaseLevel();
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_MainBaseLevel, ALL);

    OnBuild_PlaceOnTile placeOnTile = new OnBuild_PlaceOnTile();
    world.grantAccess(ChildrenTableId, address(placeOnTile));
    world.grantAccess(OwnedByTableId, address(placeOnTile));
    world.grantAccess(PositionTableId, address(placeOnTile));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), placeOnTile, ALL);

    OnBuild_SpendResources onBuild_SpendResources = new OnBuild_SpendResources();
    world.grantAccess(ResourceCountTableId, address(onBuild_SpendResources));
    world.grantAccess(SetItemUtilitiesTableId, address(onBuild_SpendResources));
    world.grantAccess(SetUtilitiesTableId, address(onBuild_SpendResources));

    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_SpendResources, ALL);

    OnBuild_MaxStorage onBuild_MaxStorage = new OnBuild_MaxStorage();
    world.grantAccess(ResourceCountTableId, address(onBuild_MaxStorage));
    world.grantAccess(MaxResourceCountTableId, address(onBuild_MaxStorage));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_MaxStorage, ALL);

    OnBuild_ProductionRate onBuild_ProductionRate = new OnBuild_ProductionRate();
    world.grantAccess(ProductionRateTableId, address(onBuild_ProductionRate));
    world.registerSystemHook(getSystemResourceId("BuildSystem"), onBuild_ProductionRate, ALL);
  }
}
