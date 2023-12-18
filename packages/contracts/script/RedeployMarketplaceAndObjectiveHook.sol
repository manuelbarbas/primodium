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
import { OnBefore_ClaimUnits } from "src/hooks/systemHooks/OnBefore_ClaimUnits.sol";
import { OnClaimObjective_Requirements } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_Requirements.sol";
import { OnClaimObjective_ReceiveRewards } from "src/hooks/systemHooks/claimObjective/OnClaimObjective_ReceiveRewards.sol";
import "codegen/index.sol";
import { Hook } from "@latticexyz/store/src/Hook.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ISystemHook } from "@latticexyz/world/src/ISystemHook.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ClaimObjectiveSystem } from "src/systems/ClaimObjectiveSystem.sol";
import { MarketplaceSystem } from "src/systems/MarketplaceSystem.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { OwnedBy, UnitCount, P_UnitPrototypes } from "codegen/index.sol";
import { EUnit } from "src/Types.sol";
import { ALL, BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;
  address worldAddress = 0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342;
  // address worldAddress = 0xdd8EbC2CBCDe94D7c12FE137D0cb47eC560ea587;
  address creator = IWorld(worldAddress).creator();

  function redeployMarketplace(IWorld world) internal {
    ResourceId marketplace = getSystemResourceId("MarketplaceSystem");
    (address addr, bool pubAcc) = Systems.get(marketplace);
    console.log("Found existing marketplace address: %s, public access: %s", addr, pubAcc);

    world.registerSystem(marketplace, new MarketplaceSystem(), true);
    (addr, pubAcc) = Systems.get(marketplace);
    console.log("new marketplace address: %s, public access: %s", addr, pubAcc);
  }

  function reregisterClaimObjectives(IWorld world) internal {
    ResourceId systemId = getSystemResourceId("ClaimObjectiveSystem");
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

    OnBefore_ClaimUnits onBefore_ClaimUnits = new OnBefore_ClaimUnits();
    world.grantAccess(UnitCountTableId, address(onBefore_ClaimUnits));
    world.grantAccess(LastClaimedAtTableId, address(onBefore_ClaimUnits));
    world.grantAccess(ClaimOffsetTableId, address(onBefore_ClaimUnits));
    world.grantAccess(QueueItemUnitsTableId, address(onBefore_ClaimUnits));
    world.grantAccess(QueueUnitsTableId, address(onBefore_ClaimUnits));
    world.grantAccess(ProducedUnitTableId, address(onBefore_ClaimUnits));
    world.registerSystemHook(systemId, onBefore_ClaimUnits, BEFORE_CALL_SYSTEM);
    console.log("registered onBefore_ClaimResources hook %s", address(onBefore_ClaimUnits));

    OnClaimObjective_Requirements onClaimObjective_Requirements = new OnClaimObjective_Requirements();
    world.registerSystemHook(systemId, onClaimObjective_Requirements, BEFORE_CALL_SYSTEM);
    console.log("registered onClaimObjective_Requirements hook %s", address(onClaimObjective_Requirements));

    OnClaimObjective_ReceiveRewards onClaimObjective_ReceiveRewards = new OnClaimObjective_ReceiveRewards();
    address hookAddress = address(onClaimObjective_ReceiveRewards);
    world.grantAccess(ResourceCountTableId, hookAddress);
    world.grantAccess(MapItemUtilitiesTableId, hookAddress);
    world.grantAccess(MapUtilitiesTableId, hookAddress);
    world.grantAccess(MapItemStoredUtilitiesTableId, hookAddress);
    world.grantAccess(UnitCountTableId, hookAddress);
    world.grantAccess(ProducedResourceTableId, hookAddress);
    world.registerSystemHook(systemId, onClaimObjective_ReceiveRewards, AFTER_CALL_SYSTEM);
    console.log("registered onClaimObjective_ReceiveRewards hook %s", address(onClaimObjective_ReceiveRewards));

    hooks = SystemHooks.get(systemId);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      console.log("claimObjective hook: %s", Hook.wrap(hooks[i]).getAddress());
    }
  }

  function run() external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    redeployMarketplace(world);
    reregisterClaimObjectives(world);

    vm.stopBroadcast();
  }
}
