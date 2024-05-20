// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { console2 } from "forge-std/Test.sol";

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/init/implementations/WorldRegistrationSystem.sol";
import { System } from "@latticexyz/world/src/System.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { UNLIMITED_DELEGATION } from "@latticexyz/world/src/constants.sol";

import { YourSystem } from "../src/systems/YourSystem.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { IWorld as IPrimodiumWorld } from "primodium/world/IWorld.sol";

contract WriteDemoTest is MudTest {
  // address public worldAddress; // inherited from MudTest

  // the environment variables are pulled from your .env
  address extensionDeployerAddress = vm.envAddress("ADDRESS_ALICE");
  address playerAddressActive = vm.envAddress("ADDRESS_PLAYER_ACTIVE");
  address playerAddressInactive = vm.envAddress("ADDRESS_PLAYER_INACTIVE");

  address playerAddressBob = vm.envAddress("ADDRESS_BOB");
  uint256 playerPrivateKeyBob = vm.envUint("PRIVATE_KEY_BOB");

  // defining these up top for use below.
  // namespaces are truncated to 14 bytes, and systems to 16 bytes.
  // namespaces must be unique, so if you get an Already Exists revert, try changing the namespace.
  // systems are also unique within a namespace, but redeploying a system will overwrite the previous version.
  bytes14 PRIMODIUM_NAMESPACE = bytes14("Pri_11");
  bytes14 namespace = bytes14("YourNamespace");
  bytes16 system = bytes16("YourSystem");

  // override MudTest setUp
  // the setUp function is run before each test function that follows
  function setUp() public override {
    // import MUD specific test setup
    super.setUp();

    // configure the target world
    worldAddress = vm.envAddress("WORLD_ADDRESS");
    StoreSwitch.setStoreAddress(worldAddress);

    // this test forks the live world state, and runs it on a local anvil instance
    // changes made in this test will not affect the live world state
    vm.createSelectFork(vm.envString("PRIMODIUM_RPC_URL"), vm.envUint("BLOCK_NUMBER"));
    console2.log("\nForkLivePrimodium is running.");

    // cache an instance of the WorldRegistrationSystem for the world
    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);

    // derive the namespaceResource and systemResource from the namespace and system
    // specifics can be found at https://mud.dev/guides/extending-a-world
    // in the Deploy to the Blockchain Explanation spoiler
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14(namespace));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, system);
    console2.log("World Address: ", worldAddress);
    console2.log("Namespace ID:   %x", uint256(ResourceId.unwrap(namespaceResource)));
    console2.log("System ID:      %x", uint256(ResourceId.unwrap(systemResource)));

    // interacting with the chain requires us to pretend to be someone
    // here, we are pretending to be the extension deployer
    vm.startPrank(extensionDeployerAddress);

    // register the namespace
    world.registerNamespace(namespaceResource);

    YourSystem yourSystem = new YourSystem();
    console2.log("YourSystem address: ", address(yourSystem));

    // register the system
    world.registerSystem(systemResource, yourSystem, true);

    // register all functions in the system
    // if you have multiple functions, you will need ro register each one
    world.registerFunctionSelector(systemResource, "YourFunction()");
    console2.log(
      "Alice successfully registered the YourNamespace namespace, YourSystem contract, YourFunction function selector, to the Primodium world address."
    );

    // stop being the system deployer
    vm.stopPrank();

    vm.startBroadcast(playerPrivateKeyBob);

    world.registerDelegation(address(yourSystem), UNLIMITED_DELEGATION, new bytes(0));
    console2.log("Bob successfully delegated to YourSystem for unlimited delegation.");

    // stop being the active player
    vm.stopBroadcast();

    // uint256 height = block.number;
    // vm.roll(height + 10);
  }

  function test_YourFunction() public {
    vm.startBroadcast(playerPrivateKeyBob);

    vm.stopBroadcast();
  }
}
