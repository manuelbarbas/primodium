// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";
import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { SystemHooks } from "@latticexyz/world/src/codegen/tables/SystemHooks.sol";
import { OnBefore_ClaimResources } from "src/hooks/systemHooks/OnBefore_ClaimResources.sol";
import { OnAlliance_TargetClaimResources } from "src/hooks/systemHooks/alliance/OnAlliance_TargetClaimResources.sol";
import "codegen/index.sol";
import { Hook } from "@latticexyz/store/src/Hook.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ISystemHook } from "@latticexyz/world/src/ISystemHook.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ClaimObjectiveSystem } from "src/systems/ClaimObjectiveSystem.sol";
import { MarketplaceSystem } from "src/systems/MarketplaceSystem.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { EUnit } from "src/Types.sol";
import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  address worldAddress = address(uint160(vm.envUint("WORLD_ADDRESS")));

  function updateAllianceHooks(IWorld world) internal {
    ResourceId systemId = getSystemResourceId("AllianceSystem");
    //unregister previous hooks
    bytes21[] memory hooks = SystemHooks.get(systemId);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      ISystemHook hook = ISystemHook(Hook.wrap(hooks[i]).getAddress());
      world.unregisterSystemHook(systemId, hook);
      console.log("unregistered hook: %s", Hook.wrap(hooks[i]).getAddress());
    }

    // register before claim resources
    OnBefore_ClaimResources onBefore_ClaimResources = new OnBefore_ClaimResources();
    world.grantAccess(ResourceCountTableId, address(onBefore_ClaimResources));
    world.grantAccess(MapItemUtilitiesTableId, address(onBefore_ClaimResources));
    world.grantAccess(MapUtilitiesTableId, address(onBefore_ClaimResources));
    world.grantAccess(MapItemStoredUtilitiesTableId, address(onBefore_ClaimResources));
    world.grantAccess(LastClaimedAtTableId, address(onBefore_ClaimResources));
    world.grantAccess(ClaimOffsetTableId, address(onBefore_ClaimResources));
    world.grantAccess(ProducedResourceTableId, address(onBefore_ClaimResources));
    world.registerSystemHook(systemId, onBefore_ClaimResources, BEFORE_CALL_SYSTEM);
    console.log("registered onBefore_ClaimResources hook %s", address(onBefore_ClaimResources));

    OnAlliance_TargetClaimResources onAlliance_TargetClaimResources = new OnAlliance_TargetClaimResources();
    address hookAddress = address(onAlliance_TargetClaimResources);
    world.grantAccess(ResourceCountTableId, hookAddress);
    world.grantAccess(MapItemUtilitiesTableId, hookAddress);
    world.grantAccess(MapUtilitiesTableId, hookAddress);
    world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
    world.grantAccess(LastClaimedAtTableId, hookAddress);
    world.grantAccess(ProducedResourceTableId, hookAddress);
    world.registerSystemHook(
      getSystemResourceId("AllianceSystem"),
      onAlliance_TargetClaimResources,
      BEFORE_CALL_SYSTEM
    );
    console.log("registered onAlliance_TargetClaimResources hook %s", hookAddress);

    hooks = SystemHooks.get(systemId);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      console.log("claimObjective hook: %s", Hook.wrap(hooks[i]).getAddress());
    }
  }

  function run() external {
    console.log("worldAddress %s", worldAddress);
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    updateAllianceHooks(world);

    vm.stopBroadcast();
  }
}
