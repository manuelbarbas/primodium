// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { console2 } from "forge-std/Test.sol";

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/core/implementations/WorldRegistrationSystem.sol"; // registering namespaces and systems
import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ReadDemoSystem } from "../src/systems/ReadDemoSystem.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract ReadDemoTest is MudTest {
  // address public worldAddress; // inherited from MudTest
  address deployerAddress = vm.envAddress("ADDRESS_ALICE");
  address playerAddress = vm.envAddress("ADDRESS_PLAYER");

  bytes14 namespace = bytes14("PluginExamples");
  bytes16 system = bytes16("ReadDemoSystem");

  // override MudTest setUp
  function setUp() public override {
    worldAddress = vm.envAddress("WORLD_ADDRESS");
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 forkId = vm.createSelectFork(vm.envString("PRIMODIUM_RPC_URL"), vm.envUint("BLOCK_NUMBER"));
    console2.log("ForkLivePrimodium is running.");

    vm.startPrank(deployerAddress);

    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14(namespace));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, system);

    console2.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console2.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    world.registerNamespace(namespaceResource);

    ReadDemoSystem readDemoSystem = new ReadDemoSystem();
    console2.log("ReadDemoSystem address: ", address(readDemoSystem));

    world.registerSystem(systemResource, readDemoSystem, true);
    world.registerFunctionSelector(systemResource, "readMainBaseLevel()");
    console2.log(
      "Alice successfully registered the PluginExamples namespace, ReadDemoSystem contract, readMainBaseLevel function selector, to the Admin's world address."
    );
    vm.stopPrank();
  }

  function testReadMainBaseLevel() public {
    vm.startPrank(playerAddress);
    uint32 baseLevel = IWorld(worldAddress).PluginExamples_ReadDemoSystem_readMainBaseLevel();
    vm.stopPrank();
    console2.log("baseLevel: ", baseLevel);
  }
}
