// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";

//components
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import { Coord, Dimensions, EAsteroidType } from "../types.sol";

import { Trigonometry as Trig } from "trig/src/Trigonometry.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";

library LibAsteroid {
  /**
   * @dev Creates a new asteroid for a player in the given world.
   * @param world The World contract address.
   * @param ownerEntity The entity ID of the owner player.
   * @return asteroidEntity The entity ID of the created asteroid.
   */
  function createAsteroid(IWorld world, uint256 ownerEntity) internal returns (uint256 asteroidEntity) {
    asteroidEntity = LibEncode.hashEntity(world, ownerEntity);

    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID));
    PositionComponent positionComponent = PositionComponent(world.getComponent(PositionComponentID));
    AsteroidCountComponent asteroidCountComponent = AsteroidCountComponent(
      world.getComponent(AsteroidCountComponentID)
    );
    uint32 asteroidCount = LibMath.increment(asteroidCountComponent, SingletonID);
    require(!asteroidTypeComponent.has(asteroidEntity), "[LibAsteroid] asteroid already exists");

    Coord memory position = getUniqueAsteroidPosition(ownerEntity, asteroidCount);

    positionComponent.set(asteroidEntity, position);
    asteroidTypeComponent.set(asteroidEntity, uint256(EAsteroidType.NORMAL));

    // For now, we will use this component to ensure the owner can only build on their asteroid.
    // TODO: remove this component later as it might be for temporary use.
    positionComponent.set(ownerEntity, 0, 0, asteroidEntity);
    uint256 encodedPosition = LibEncode.encodeCoord(position);

    // Mark the asteroid's position as active in the ActiveComponent.
    ActiveComponent(world.getComponent(ActiveComponentID)).set(encodedPosition);

    asteroidCountComponent.set(SingletonID, asteroidCount);
  }

  /**
   * @dev Gets a unique asteroid position for the player in the given world.
   * @param playerEntity The entity ID of the player.
   * @return position The unique position (Coord) for the asteroid.
   */
  function getUniqueAsteroidPosition(
    uint256 playerEntity,
    uint32 asteroidCount
  ) internal view returns (Coord memory position) {
    // Get the ActiveComponent to check for active positions.

    uint32 distance = asteroidCount * 2 + 5;
    position = getPositionByVector(distance, getDirection(asteroidCount, playerEntity));
  }

  function getPositionByVector(uint32 _distance, uint32 direction) internal pure returns (Coord memory) {
    uint32 angleDegs = (direction) % 360;

    uint256 angleRadsTimes10000 = uint256(angleDegs * 1745);

    uint256 angleRadsConverted = angleRadsTimes10000 * 1e13 + Trig.TWO_PI;

    int256 newX = Trig.cos(angleRadsConverted) * int32(_distance);

    int256 newY = Trig.sin(angleRadsConverted) * int32(_distance);

    int32 finalX = int32(newX / 1e18);
    int32 finalY = int32(newY / 1e18);

    return Coord({ x: finalX, y: finalY, parent: 0 });
  }

  function getDirection(uint32 asteroidCount, uint256 playerEntity) internal view returns (uint32) {
    uint32 rng = uint32(uint256(keccak256(abi.encode(asteroidCount, playerEntity, block.number))));
    uint32 rng2 = rng % 17;
    rng = rng % 3;
    uint32 generalDirection = asteroidCount % 4;
    return generalDirection * 90 + rng * 30 + rng2;
  }
}
