// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { PositionData, Level } from "../codegen/index.sol";
import { Counter } from "../codegen/index.sol";
import { IsActive } from "../codegen/index.sol";

interface WorldWithUpgradeBuilding {
  function upgradeBuilding(PositionData memory coord) external returns (bytes32 buildingEntity);
}

contract BuildingUpgradeBountySystem is System {
  function upgrade() public returns (uint32) {
    uint32 counter = Counter.get();
    uint32 newValue = counter + 1;
    Counter.set(newValue);
    return newValue;
  }
}
