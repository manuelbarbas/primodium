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

// For deploying UpgrBounSystem
import { UpgrBounSystem } from "../src/systems/UpgrBounSystem.sol";

// For registering Delegation
import { SystemboundDelegationControl } from "@latticexyz/world-modules/src/modules/std-delegations/SystemboundDelegationControl.sol";
import { SYSTEMBOUND_DELEGATION } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";

contract UpgradeBountyExtension is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
    console.log("Alice private key: %x", deployerPrivateKey);
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console.log("World Address: %x", worldAddress);

    // Prep encoding the Ids before executing anything
    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("upgradeBounty"));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "upgradeBounty", "UpgrBounSystem");

    // Visual debug check
    console.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    vm.startBroadcast(deployerPrivateKey);

    world.registerNamespace(namespaceResource); // registers namespace to world address
    StoreSwitch.setStoreAddress(worldAddress); // sets the store address to the world address
    Messages.register(); // registers the Messages table to the world address

    UpgrBounSystem upgrBounSystem = new UpgrBounSystem(); // creates/deploys a new UpgrBounSystem contract, store its address
    console.log("UpgrBounSystem address: ", address(upgrBounSystem));

    world.registerSystem(systemResource, upgrBounSystem, false); // registers the UpgrBounSystem contract address to the UpgrBounSystem namespace and resourceID in the world address, allows anyone to access the System

    // Register UpgrBounSystem.incrementMessage(string) as a function selector to make it accessible through the World.
    // When called through the world (MUD version 2.0.0-next.16^), it will be through <namespace>__<function>, e.g. "upgradeBounty__incrementMessage(string)"
    // If MUD version is 2.0.0-next.15 or lower, it will be through <namespace>_<system>_<function>, e.g. "upgradeBounty_UpgrBounSystem_incrementMessage(string)"
    world.registerFunctionSelector(systemResource, "depositBounty((int32,int32,bytes32))");
    world.registerFunctionSelector(systemResource, "withdrawBounty((int32,int32,bytes32))");
    world.registerFunctionSelector(systemResource, "upgradeForBounty(address,(int32,int32,bytes32))");
    console.log(
      "Alice successfully registered the upgradeBounty namespace, Messages table, and UpgrBounSystem contract to the Admin's world address."
    );

    // !! note UpgradeBuildingS is due to 16 byte restriction. verify this works!
    ResourceId upgradeBuildingSystemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: ROOT_NAMESPACE,
      name: "UpgradeBuildingS"
    });
    console.log("worldresourceIdLib.encode completed. UpgradeBuildingSystem system ID: ");
    // Alice delegates to the UpgrBounSystem contract
    world.registerDelegation(
      address(upgrBounSystem),
      SYSTEMBOUND_DELEGATION,
      abi.encodeCall(
        SystemboundDelegationControl.initDelegation,
        (address(upgrBounSystem), upgradeBuildingSystemId, 100)
      )
    );
    console.log("Alice successfully registered her systembound delegation to the UpgrBounSystem contract address.");

    vm.stopBroadcast();
  }
}
