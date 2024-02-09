// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IBaseWorld } from "@latticexyz/world-modules/src/interfaces/IBaseWorld.sol"; // get definitions common to all World contracts

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/core/implementations/WorldRegistrationSystem.sol"; // registering namespaces and systems

// Create resource identifiers (for the namespace and system)
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// For registering the table
import { Messages, MessagesTableId } from "../src/codegen/index.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

// For deploying MessageSystem
import { MessageSystem } from "../src/systems/MessageSystem.sol";

// For registering Delegation
import { SystemboundDelegationControl } from "@latticexyz/world-modules/src/modules/std-delegations/SystemboundDelegationControl.sol";
import { SYSTEMBOUND_DELEGATION } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";

contract MessagingExtension is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
    console.log("Alice private key: %x", deployerPrivateKey);
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console.log("World Address: %x", worldAddress);

    // Prep encoding the Ids before executing anything
    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("upgradeBounty"));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "upgradeBounty", "MessageSystem");

    // Visual debug check
    console.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    vm.startBroadcast(deployerPrivateKey);

    world.registerNamespace(namespaceResource); // registers namespace to world address
    StoreSwitch.setStoreAddress(worldAddress); // sets the store address to the world address
    Messages.register(); // registers the Messages table to the world address

    MessageSystem messageSystem = new MessageSystem(); // creates/deploys a new MessageSystem contract, store its address
    console.log("MessageSystem address: ", address(messageSystem));

    world.registerSystem(systemResource, messageSystem, false); // registers the MessageSystem contract address to the MessageSystem namespace and resourceID in the world address, allows anyone to access the System

    // Register MessageSystem.incrementMessage(string) as a function selector to make it accessible through the World.
    // When called through the world (MUD version 2.0.0-next.16^), it will be through <namespace>__<function>, e.g. "upgradeBounty__incrementMessage(string)"
    // If MUD version is 2.0.0-next.15 or lower, it will be through <namespace>_<system>_<function>, e.g. "upgradeBounty_MessageSystem_incrementMessage(string)"
    world.registerFunctionSelector(systemResource, "incrementMessage(string)");
    world.registerFunctionSelector(systemResource, "incrementMessageFrom(address,string)");
    console.log(
      "Alice successfully registered the upgradeBounty namespace, Messages table, and MessageSystem contract to the Admin's world address."
    );

    ResourceId counterSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, ROOT_NAMESPACE, "IncrementSystem");

    // Alice delegates to the MessageSystem contract
    world.registerDelegation(
      address(messageSystem),
      SYSTEMBOUND_DELEGATION,
      abi.encodeCall(SystemboundDelegationControl.initDelegation, (address(messageSystem), counterSystemId, 2))
    );
    console.log("Alice successfully registered systembound delegation to the MessageSystem contract address.");

    vm.stopBroadcast();
  }
}
