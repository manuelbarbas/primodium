// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IBaseWorld } from "@latticexyz/world-modules/src/interfaces/IBaseWorld.sol"; // get definitions common to all World contracts

import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/core/implementations/WorldRegistrationSystem.sol"; // registering namespaces and systems
import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ReadDemoSystem } from "../src/systems/ReadDemoSystem.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract RegisterReadDemoSystem is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
    console.log("Alice private key: %x", deployerPrivateKey);
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console.log("World Address: %x", worldAddress);

    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("ReadDemo"));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ReadDemo", "ReadDemoSystem");

    // Visual debug check
    console.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    vm.startBroadcast(deployerPrivateKey);

    world.registerNamespace(namespaceResource);
    StoreSwitch.setStoreAddress(worldAddress);

    ReadDemoSystem readDemoSystem = new ReadDemoSystem();
    console.log("ReadDemoSystem address: ", address(readDemoSystem));

    world.registerSystem(systemResource, readDemoSystem, true);
    world.registerFunctionSelector(systemResource, "readMainBaseLevel()");
    console.log(
      "Alice successfully registered the ReadDemo namespace, and ReadDemo contract to the Admin's world address."
    );
    vm.stopBroadcast();
  }
}
