// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { console } from "forge-std/console.sol";

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/core/implementations/WorldRegistrationSystem.sol"; // registering namespaces and systems
import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ReadDemoSystem } from "../src/systems/ReadDemoSystem.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract ReadDemoTest is Test {
  address worldAddress = vm.envAddress("WORLD_ADDRESS");
  address deployerAddress = vm.envAddress("ADDRESS_ALICE");
  address playerAddress = vm.envAddress("ADDRESS_PLAYER");

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.envString("PRIMODIUM_RPC_URL"), vm.envUint("BLOCK_NUMBER"));
    console.log("ForkLivePrimodium is running.");

    vm.startPrank(deployerAddress);

    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("ReadDemo"));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ReadDemo", "ReadDemoSystem");

    console.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    world.registerNamespace(namespaceResource);
    StoreSwitch.setStoreAddress(worldAddress);

    ReadDemoSystem readDemoSystem = new ReadDemoSystem();
    console.log("ReadDemoSystem address: ", address(readDemoSystem));

    world.registerSystem(systemResource, readDemoSystem, true);
    world.registerFunctionSelector(systemResource, "readMainBaseLevel()");
    console.log(
      "Alice successfully registered the ReadDemo namespace, and ReadDemo contract to the Admin's world address."
    );
    vm.stopPrank();
  }

  function test_readMainBaseLevel() public {
    IWorld iworld = IWorld(worldAddress);
    vm.startPrank(playerAddress);
    uint32 baseLevel = iworld.ReadDemo_ReadDemoSystem_readMainBaseLevel();
    vm.stopPrank();
    console.log("baseLevel: ", baseLevel);
  }
}
