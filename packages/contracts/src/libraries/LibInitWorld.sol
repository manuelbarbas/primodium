// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { Dimensions, Coord } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

import "../prototypes.sol";

library LibInitWorld {
  function init(IWorld world) internal {
    // todo: make the universe the correct size
    Dimensions memory maxRange = Dimensions(37, 25);
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, Dimensions(100, 100));
    initRange(world, maxRange);
    PositionComponent(world.getComponent(PositionComponentID)).set(
      MainBaseID,
      Coord(maxRange.x / 2, maxRange.y / 2, 0)
    );
  }

  function initRange(IWorld world, Dimensions memory maxRange) internal {
    DimensionsComponent dimensionsComponent = DimensionsComponent(world.getComponent(DimensionsComponentID));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 1), Dimensions(13, 11));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 2), Dimensions(17, 13));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 3), Dimensions(21, 15));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 4), Dimensions(25, 17));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 5), Dimensions(29, 19));
    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 6), Dimensions(33, 23));

    dimensionsComponent.set(LibEncode.hashKeyEntity(ExpansionResearch, 7), maxRange);
    dimensionsComponent.set(SingletonID, maxRange);
  }
}
