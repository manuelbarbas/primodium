// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";
import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";

import { S_ClaimSystem } from "src/systems/subsystems/S_ClaimSystem.sol";

// we can use this as an example script moving forward

contract RedeployClaimUnits is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess.get(resourceId.getNamespaceId(), caller) || ResourceAccess.get(resourceId, caller);
  }

  function redeployClaim(IWorld world) internal {
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "S_ClaimSystem");
    (address systemAddr, bool publicAccess) = Systems.get(systemId);
    console.log("Found existing system address: %s, public access: %s", systemAddr, publicAccess);

    world.registerSystem(systemId, new S_ClaimSystem(), true);
    (systemAddr, publicAccess) = Systems.get(systemId);
    console.log("new system address: %s, public access: %s", systemAddr, publicAccess);
  }

  function run() external {
    console.log("running script at ", block.timestamp);
    address worldAddress = address(uint160(vm.envUint("WORLD_ADDRESS")));
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    redeployClaim(world);

    vm.stopBroadcast();
  }
}
