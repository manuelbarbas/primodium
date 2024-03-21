// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/Test.sol";

import { ReadDemoSystem } from "../src/systems/ReadDemoSystem.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract ReadMainBaseLevel is Script {
  function run() external {
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console2.log("World Address: %x", worldAddress);
    address playerAddress = vm.envAddress("ADDRESS_PLAYER");
    console2.log("Player Address: %x", playerAddress);

    vm.startBroadcast(playerAddress);

    // you can cache the IWorld, or cast it inline as seen in the test script
    IWorld iworld = IWorld(worldAddress);

    // Mud version 2.0.0-main-9ef3f9a7 uses format namespace_system_function
    uint32 baseLevel = iworld.PluginExamples_ReadDemoSystem_readMainBaseLevel(); // use with Mud version 2.0.0-main-9ef3f9a7

    // Mud version 2.0.0-next.17 removes system from the final function name
    // uint32 baseLevel = iworld.PluginExamples__readMainBaseLevel(); // use with Mud version 2.0.0-next.17
    vm.stopBroadcast();
    console2.log("baseLevel: ", baseLevel);
  }
}
