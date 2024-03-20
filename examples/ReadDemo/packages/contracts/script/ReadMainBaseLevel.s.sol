// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { ReadDemoSystem } from "../src/systems/ReadDemoSystem.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract ReadMainBaseLevel is Script {
  function run() external {
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console.log("World Address: %x", worldAddress);
    address playerAddress = vm.envAddress("ADDRESS_PLAYER");
    console.log("Player Address: %x", playerAddress);

    vm.startBroadcast(playerAddress);
    IWorld iworld = IWorld(worldAddress);
    uint32 baseLevel = iworld.PluginExamples_ReadDemoSystem_readMainBaseLevel();
    vm.stopBroadcast();
    console.log("baseLevel: ", baseLevel);
  }
}
