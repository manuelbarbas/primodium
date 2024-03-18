// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";

import { DUMMY_ADDRESS } from "src/constants.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";
import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { S_StorageSystem } from "src/systems/subsystems/S_StorageSystem.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { OwnedBy, UnitCount, P_UnitPrototypes } from "codegen/index.sol";
import { EUnit } from "src/Types.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess.get(resourceId.getNamespaceId(), caller) || ResourceAccess.get(resourceId, caller);
  }

  function redeployStorageSubsystem(IWorld world) internal {
    ResourceId storageSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "S_StorageSystem");
    (address storageAddr, bool publicAccess) = Systems.get(storageSystemId);
    console.log("Found existing S_StorageSystem address: %s, public access: %s", storageAddr, publicAccess);
    (storageAddr, publicAccess) = Systems.get(storageSystemId);

    world.registerSystem(storageSystemId, new S_StorageSystem(), false);
    (storageAddr, publicAccess) = Systems.get(storageSystemId);
    console.log("new S_StorageSystem address: %s, public access: %s", storageAddr, publicAccess);

    world.grantAccess(storageSystemId, DUMMY_ADDRESS);

    console.log("dummy has access to storage system: ", hasAccess(storageSystemId, DUMMY_ADDRESS));
  }

  function run() external {
    address worldAddress = address(uint160(vm.envUint("WORLD_ADDRESS")));
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    redeployStorageSubsystem(world);

    vm.stopBroadcast();
  }
}
