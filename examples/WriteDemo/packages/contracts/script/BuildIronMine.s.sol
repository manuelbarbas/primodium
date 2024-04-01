// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/Test.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract BuildIronMine is Script {
  function run() external {
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console2.log("World Address: %x", worldAddress);
    uint256 playerPrivateKeyBob = vm.envUint("PRIVATE_KEY_BOB");
    console2.log("Player Private Key: %x", playerPrivateKeyBob);

    vm.startBroadcast(playerPrivateKeyBob);

    // you can cache the IWorld, or cast it inline as seen in the test script
    IWorld iworld = IWorld(worldAddress);

    // function format is namespace__function
    iworld.PluginExamples__buildIronMine();

    vm.stopBroadcast();
    console2.log("Iron Mine Built on Main Base");
  }
}
