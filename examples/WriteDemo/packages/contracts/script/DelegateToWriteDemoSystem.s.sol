// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/Test.sol";

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/init/implementations/WorldRegistrationSystem.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { WriteDemoSystem } from "../src/systems/WriteDemoSystem.sol";

contract RegisterReadDemoSystem is Script {
  // the environment variables are pulled from your .env
  address worldAddress = vm.envAddress("WORLD_ADDRESS");
  address playerAddress = vm.envAddress("ADDRESS_PLAYER");
  address playerPrivateKeyBob = vm.envAddress("PRIVATE_KEY_BOB");

  // predefine the namespace and system
  bytes14 namespace = bytes14("PluginExamples");
  bytes16 system = bytes16("WriteDemoSystem");

  // calling a script executes the run() function
  function run() external {
    StoreSwitch.setStoreAddress(worldAddress);

    // cache an instance of the WorldRegistrationSystem for the world
    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);

    // derive the namespaceResource and systemResource from the namespace and system
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14(namespace));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, system);
    console2.log("World Address: %x", worldAddress);
    console2.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console2.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));
    console2.log("Bob private key: %x", playerPrivateKeyBob);

    vm.startBroadcast(playerPrivateKeyBob);

    // Before a system can take actions on behalf of a player, they have to delegate
    // authority to the system.  There are various delegation levels, but for this demo,
    // we will use the UNLIMITED delegation level.
    world.registerDelegation(address(writeDemoSystem), UNLIMITED_DELEGATION, new bytes(0));
    console2.log("Bob successfully delegated to WriteDemoSystem for UNLIMITED delegation.");

    vm.stopBroadcast();
  }
}
