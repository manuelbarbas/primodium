// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "components/P_MaxBuildingsComponent.sol";

library LibInitWorld {
  function init(IWorld world) internal {
    initMaxBuildings(world);
  }

  function initMaxBuildings(IWorld world) internal {
    P_MaxBuildingsComponent maxBuildingsComponent = P_MaxBuildingsComponent(
      world.getComponent(P_MaxBuildingsComponentID)
    );
    maxBuildingsComponent.set(uint256(1), 4);
    maxBuildingsComponent.set(uint256(2), 7);
    maxBuildingsComponent.set(uint256(3), 11);
    maxBuildingsComponent.set(uint256(4), 15);
    maxBuildingsComponent.set(uint256(5), 24);
    maxBuildingsComponent.set(uint256(6), 32);
  }
}
