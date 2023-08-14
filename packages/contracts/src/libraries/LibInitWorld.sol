// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "components/P_MaxBuildingsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { Dimensions, Coord } from "../types.sol";
import "../prototypes.sol";

library LibInitWorld {
  function init(IWorld world) internal {
    // todo: make the universe the correct size
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, Dimensions(100, 100));
    initMaxBuildings(world);
    PositionComponent(world.getComponent(PositionComponentID)).set(MainBaseID, Coord(17, 13, 0));
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
