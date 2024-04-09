// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/Test.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract InteractWithYourSystem is Script {
  function run() external {
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console2.log("World Address: %x", worldAddress);
    uint256 playerPrivateKeyBob = vm.envUint("PRIVATE_KEY_BOB");
    console2.log("Player Private Key: %x", playerPrivateKeyBob);

    vm.startBroadcast(playerPrivateKeyBob);

    // you can cache the IWorld, or cast it inline as seen in the test script
    IWorld iworld = IWorld(worldAddress);

    // Before a system can take actions on behalf of a player, they have to delegate
    // authority to the system.  There are various delegation levels, but for this demo,
    // we will use the UNLIMITED delegation level.

    // uncomment if needed
    // world.registerDelegation(address(yourSystem), UNLIMITED_DELEGATION, new bytes(0));

    // function format is namespace__function
    iworld.YourNamespace__YourFunction();

    vm.stopBroadcast();
  }
}
