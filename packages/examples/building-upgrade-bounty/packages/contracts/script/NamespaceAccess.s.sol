// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IBaseWorld } from "@latticexyz/world-modules/src/interfaces/IBaseWorld.sol"; // get definitions common to all World contracts

import { AccessManagementSystem } from "@latticexyz/world/src/modules/core/implementations/AccessManagementSystem.sol";

// Create resource identifiers (for the namespace and system)
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

//
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract NamespaceAccess is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
    console.log("Alice private key: %x", deployerPrivateKey);
    address delegateeAddress = address(uint160(vm.envUint("ADDRESS_BOB")));
    console.log("Bob address: %x", delegateeAddress);
    uint256 delegateePrivateKey = vm.envUint("PRIVATE_KEY_BOB");
    console.log("Bob private key: %x", delegateePrivateKey);
    address worldAddress = vm.envAddress("WORLD_ADDRESS");

    // Prep encoding the Ids before executing anything
    IWorld world = IWorld(worldAddress);
    AccessManagementSystem worldAccess = AccessManagementSystem(worldAddress);
    ResourceId messageSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "upgradeBounty", "MessageSystem");
    // Visual debug check
    console.log("System ID:    %x", uint256(ResourceId.unwrap(messageSystemResource)));
    // Add access control
    vm.startBroadcast(deployerPrivateKey);
    worldAccess.grantAccess(messageSystemResource, delegateeAddress);
    vm.stopBroadcast();
    console.log("Alice granted Bob access to MessageSystem.");

    // Bob uses MessageSystem's delegated callFrom to increment Alice's counter
    vm.startBroadcast(delegateePrivateKey);
    uint256 newValue = world.upgradeBounty_MessageSystem_incrementMessageFrom(
      vm.envAddress("ADDRESS_ALICE"),
      "Hello, it's Bob. I'm incrementing Alice's counter."
    );
    vm.stopBroadcast();
    console.log("Bob incremented Alice's Counter to %x. Check the localhost:3001 client to see the message.", newValue);

    // Alice uses MessageSystem's incrementMessage to increment MessageSystem's counter
    vm.startBroadcast(deployerPrivateKey);
    newValue = world.upgradeBounty_MessageSystem_incrementMessage(
      "Hi Bob, it's Alice responding. I'm now incrementing the MessageSystem's counter."
    );
    vm.stopBroadcast();
    console.log(
      "Alice incremented the MessageSystem counter to %x. Check the localhost:3001 client to see the message.",
      newValue
    );
    /*
    // quick test: does anyone have access to the system?
    uint256 hostilePrivateKey = vm.envUint("PRIVATE_KEY_MALLORY");
    console.log("Mallory private key: %x", hostilePrivateKey);
    
    vm.startBroadcast(delegateePrivateKey);
    IWorld(worldAddress).upgradeBounty_MessageSystem_incrementMessage("Mallory wuz here :P  !!alert: successful unauthorized access");
    vm.stopBroadcast();
    */
  }
}
