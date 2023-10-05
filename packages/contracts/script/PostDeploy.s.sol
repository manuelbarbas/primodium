// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

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
import { ALL } from "@latticexyz/store/src/storeHookTypes.sol";

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

    MirrorSubscriber subscriber = new MirrorSubscriber(HookedValueTableId, world);
    console.log("Subscriber Created");
    world.grantAccess(OnHookChangedValueTableId, address(subscriber));
    world.registerStoreHook(HookedValueTableId, subscriber, ALL);

    //StoreCore.registerStoreHook(HookedValueTableId, subscriber, ALL);
    console.log("Subscriber Hooked");

    vm.stopBroadcast();
  }
}
