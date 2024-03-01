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

import { P_ByLevelMaxResourceUpgrades } from "codegen/index.sol";
import { SAMPrototypeId } from "codegen/Prototypes.sol";
import { EResource } from "src/Types.sol";

// we can use this as an example script moving forward

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  function patchHpStorageUpgrades(IWorld world) internal {
    P_ByLevelMaxResourceUpgrades.set(SAMPrototypeId, uint8(EResource.R_HP), 1, 400000000000000000000);
    P_ByLevelMaxResourceUpgrades.set(SAMPrototypeId, uint8(EResource.R_HP), 2, 800000000000000000000);
    P_ByLevelMaxResourceUpgrades.set(SAMPrototypeId, uint8(EResource.R_HP), 3, 1200000000000000000000);
  }

  function run() external {
    address worldAddress = address(uint160(vm.envUint("WORLD_ADDRESS")));
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);
    address creator = IWorld(worldAddress).creator();

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    patchHpStorageUpgrades(world);

    vm.stopBroadcast();
  }
}
