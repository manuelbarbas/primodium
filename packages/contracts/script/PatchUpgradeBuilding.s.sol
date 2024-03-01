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

import { UpgradeBuildingSystem } from "src/systems/UpgradeBuildingSystem.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;
  address worldAddress = 0xdd8EbC2CBCDe94D7c12FE137D0cb47eC560ea587;
  address creator = IWorld(worldAddress).creator();

  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess.get(resourceId.getNamespaceId(), caller) || ResourceAccess.get(resourceId, caller);
  }

  function redeployUpgradeBuilding(IWorld world) internal {
    ResourceId upgradeBuildingSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "UpgradeBuildingS");
    (address systemAddr, bool publicAccess) = Systems.get(upgradeBuildingSystemId);
    console.log("Found existing UpgradeBuildingSystem address: %s, public access: %s", systemAddr, publicAccess);

    world.registerSystem(upgradeBuildingSystemId, new UpgradeBuildingSystem(), true);
    (systemAddr, publicAccess) = Systems.get(upgradeBuildingSystemId);
    console.log("new UpgradeBuildingSystem address: %s, public access: %s", systemAddr, publicAccess);
  }

  function run() external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    redeployUpgradeBuilding(world);

    vm.stopBroadcast();
  }
}
