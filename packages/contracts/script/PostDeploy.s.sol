// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { setupHooks } from "script/SetupHooks.sol";
import { createPrototypes } from "codegen/Prototypes.sol";
import { createTerrain } from "codegen/scripts/CreateTerrain.sol";
import { SpawnAllowed, Counter } from "codegen/index.sol";

import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { StandardDelegationsModule } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    IWorld world = IWorld(worldAddress);
    console.log("world address:", worldAddress);
    vm.startBroadcast(deployerPrivateKey);
    StoreSwitch.setStoreAddress(worldAddress);
    world.Pri_11__increment();

    world.installRootModule(new StandardDelegationsModule(), new bytes(0));

    createPrototypes(world);
    console.log("Prototypes created");
    createTerrain();
    console.log("Terrain created");
    setupHooks(world);
    console.log("Hooks setup");

    // register the persistent layer namespace to prevent frontrunning
    bytes14 namespace = "Primodium";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    world.registerNamespace(namespaceId);
    // Allow players to spawn. Ensures players cannot spawn until the post-deploy script has finished.
    SpawnAllowed.set(true);
    vm.stopBroadcast();
  }
}
