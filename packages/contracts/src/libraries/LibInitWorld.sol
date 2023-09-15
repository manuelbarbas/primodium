// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID } from "components/GameConfigComponent.sol";
import { P_WorldSpeedComponent, ID as P_WorldSpeedComponentID, SPEED_SCALE } from "components/P_WorldSpeedComponent.sol";
import { Dimensions, Coord, GameConfig } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

import "../prototypes.sol";

library LibInitWorld {
  function init(IWorld world) internal {
    // todo: make the universe the correct size
    GameConfig memory config = GameConfig({
      moveSpeed: 10000,
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 4
    });

    Dimensions memory maxRange = Dimensions(37, 25);
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, maxRange);
    GameConfigComponent(world.getComponent(GameConfigComponentID)).set(SingletonID, config);
    PositionComponent(world.getComponent(PositionComponentID)).set(
      MainBaseID,
      Coord(maxRange.x / 2, maxRange.y / 2, 0)
    );
    P_WorldSpeedComponent(world.getComponent(P_WorldSpeedComponentID)).set(SingletonID, SPEED_SCALE);
  }
}
