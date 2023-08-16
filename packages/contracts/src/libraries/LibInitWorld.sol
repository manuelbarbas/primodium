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
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, maxRange);
    PositionComponent(world.getComponent(PositionComponentID)).set(
      MainBaseID,
      Coord(maxRange.x / 2, maxRange.y / 2, 0)
    );
  }
}
