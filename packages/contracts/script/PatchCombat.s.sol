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

import { FleetCombatSystem } from "src/systems/FleetCombatSystem.sol";
import { S_BattleRaidResolveSystem } from "src/systems/subsystems/S_BattleRaidResolveSystem.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess.get(resourceId.getNamespaceId(), caller) || ResourceAccess.get(resourceId, caller);
  }

  function redeployCombat(IWorld world) internal {
    console.log("redeployCombat");
    ResourceId fleetCombatSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "FleetCombatSyste");
    (address systemAddr, bool publicAccess) = Systems.get(fleetCombatSystemId);
    console.log("Found existing system address: %s, public access: %s", systemAddr, publicAccess);

    world.registerSystem(fleetCombatSystemId, new FleetCombatSystem(), true);
    (systemAddr, publicAccess) = Systems.get(fleetCombatSystemId);
    console.log("new system address: %s, public access: %s", systemAddr, publicAccess);
  }

  function redeployResolveRaid(IWorld world) internal {
    console.log("redeployResolveRaid");
    ResourceId resolveRaidSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "S_BattleRaidReso");
    (address systemAddr, bool publicAccess) = Systems.get(resolveRaidSystemId);
    console.log("Found existing system address: %s, public access: %s", systemAddr, publicAccess);

    world.registerSystem(resolveRaidSystemId, new S_BattleRaidResolveSystem(), false);
    world.grantAccess(resolveRaidSystemId, DUMMY_ADDRESS);
    (systemAddr, publicAccess) = Systems.get(resolveRaidSystemId);
    console.log("new system address: %s, public access: %s", systemAddr, publicAccess);
    address creator = world.creator();
    console.log("creator has access:", hasAccess(resolveRaidSystemId, creator));
    console.log("DUMMY_ADDRESS has access:", hasAccess(resolveRaidSystemId, DUMMY_ADDRESS));
  }

  function run() external {
    address worldAddress = address(uint160(vm.envAddress("WORLD_ADDRESS")));
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    redeployCombat(world);
    redeployResolveRaid(world);

    vm.stopBroadcast();
  }
}
