// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "components/P_MaxBuildingsComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import { Dimensions } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

import "../prototypes.sol";

library LibInitWorld {
  function init(IWorld world) internal {
    // todo: make the universe the correct size
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, Dimensions(100, 100));
    initMaxBuildings(world);
    initRange(world);
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

  function initRange(IWorld world) internal {
    DimensionsComponent dimensionsComponent = DimensionsComponent(world.getComponent(DimensionsComponentID));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 1), Dimensions(13, 11));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 2), Dimensions(17, 13));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 3), Dimensions(21, 15));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 4), Dimensions(25, 17));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 5), Dimensions(29, 19));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 6), Dimensions(33, 23));

    Dimensions memory maxRange = Dimensions(37, 25);
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 7), maxRange);
    dimensionsComponent.set(SingletonID, maxRange);
  }
}
