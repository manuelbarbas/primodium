// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// tables
import { Player, ReversePosition, OwnedBy, Position, PositionData, AsteroidCount, RockType, PositionData } from "codegen/Tables.sol";

import { ERock } from "codegen/Types.sol";

import { IWorld } from "../codegen/world/IWorld.sol";

import { LibMath, LibEncode } from "libraries/Libraries.sol";
import { Trigonometry as Trig } from "trig/src/Trigonometry.sol";
import { ABDKMath64x64 as Math } from "abdk/ABDKMath64x64.sol";

library LibAsteroid {
  /**
   * @dev Creates a new asteroid for a player in the given world.
   * @param ownerEntity The entity ID of the owner player.
   * @return asteroidEntity The entity ID of the created asteroid.
   */

  function createAsteroid(address world, bytes32 ownerEntity)
    internal
    returns (bytes32 asteroidEntity)
  {
    asteroidEntity = LibEncode.getHash(world, ownerEntity);
    require(
      RockType.get(asteroidEntity) == uint8(ERock.Null),
      "[LibAsteroid] asteroid already exists"
    );

    uint32 asteroidCount = AsteroidCount.get() + 1;
    PositionData memory position = getUniqueAsteroidPosition(asteroidCount);

    Position.set(asteroidEntity, position);
    RockType.set(asteroidEntity, uint8(ERock.Asteroid));
    Player.set(ownerEntity, true, asteroidEntity);
    // Mark the asteroid's position as active in the ReversePositionComponent.
    ReversePosition.set(position.x, position.y, asteroidEntity);
    OwnedBy.set(asteroidEntity, ownerEntity);
    AsteroidCount.set(asteroidCount);
  }

  /**
   * @dev Gets a unique asteroid position for the player in the given world.
   * @return position The unique position (Coord) for the asteroid.
   */

  function getUniqueAsteroidPosition(uint32 asteroidCount)
    internal
    view
    returns (PositionData memory position)
  {
    position = getPositionByVector(
      getDistance(asteroidCount),
      getDirection(asteroidCount)
    );
    while (ReversePosition.get(position.x, position.y) != 0) {
      position.y += 5;
    }
  }

  /**
   * todo: move this function to a separate library
   * @dev Calculates the position (x, y) based on a given distance and direction.
   * @param _distance The distance to be moved.
   * @param direction The direction angle in degrees.
   * @return Coord Returns a struct containing x and y coordinates.
   */
  function getPositionByVector(uint32 _distance, uint32 direction)
    internal
    pure
    returns (PositionData memory)
  {
    direction = direction % 360;
    bool flip = direction >= 180;
    direction = direction % 180;
    uint256 angleDegsTimes10000 = direction * 1745;

    uint256 angleRads = angleDegsTimes10000 * 1e13 + Trig.TWO_PI;

    int256 newX = Trig.cos(angleRads) * int32(_distance);
    int256 newY = Trig.sin(angleRads) * int32(_distance);
    int32 x = int32((newX / 1e18));
    int32 y = int32((newY / 1e18));
    return PositionData({ x: flip ? -x : x, y: flip ? -y : y, parent: 0 });
  }

  /**
   * @dev Calculates the distance based on the given asteroid count.
   *      The equation is 260 * ln((asteroidCount + 105) / 10) - 580
   * @param asteroidCount Number of asteroids.
   * @return uint32 Returns the calculated distance.
   */
  function getDistance(uint32 asteroidCount) internal pure returns (uint32) {
    int128 value = Math.add(Math.fromUInt(asteroidCount), Math.fromUInt(105));
    value = Math.div(value, Math.fromUInt(10));
    value = Math.ln(value);
    uint256 integer = Math.mulu(value, 260);
    return uint32(integer - 580);
  }

  /**
   * @dev Determines the general direction based on the given asteroid count.
   * @param asteroidCount Number of asteroids.
   * @return uint32 Returns the calculated direction.
   */
  function getDirection(uint32 asteroidCount) internal pure returns (uint32) {
    uint32 countMod27 = asteroidCount % 27;
    uint32 countMod3 = asteroidCount % 3;
    uint32 generalDirection = asteroidCount % 4;
    return generalDirection * 90 + countMod3 * 30 + countMod27;
  }
}
