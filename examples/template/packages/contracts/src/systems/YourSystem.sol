// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

// Primodium Tables
import "primodium/index.sol";
import "primodium/common.sol";

import "src/Types.sol";
import "src/Keys.sol";

import { IWorld as IPrimodiumWorld } from "primodium/world/IWorld.sol";

import { console } from "forge-std/console.sol";

// We're building a System, to extend the System contract
contract YourSystem is System {
  bytes14 PRIMODIUM_NAMESPACE = bytes14("Pri_11");

  function YourFunction() public {
    // we want to read from the Primodium World, not the Extension World
    StoreSwitch.setStoreAddress(_world());
  }
}
