// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";

//components
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";

import { Coord, EAsteroidType } from "../types.sol";

import { LibEncode } from "libraries/LibEncode.sol";

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
    require(!asteroidTypeComponent.has(asteroidEntity), "[LibAsteroid] asteroid already exists");

    Coord memory position = getUniqueAsteroidPosition(world, ownerEntity);

    positionComponent.set(asteroidEntity, position);
    asteroidTypeComponent.set(asteroidEntity, uint256(EAsteroidType.NORMAL));

    // For now, we will use this component to ensure the owner can only build on their asteroid.
    // TODO: remove this component later as it might be for temporary use.
    positionComponent.set(ownerEntity, 0, 0, asteroidEntity);
    uint256 encodedPosition = LibEncode.encodeCoord(position);

    // Mark the asteroid's position as active in the ActiveComponent.
    ActiveComponent(world.getComponent(ActiveComponentID)).set(encodedPosition);
  }

  /**
   * @dev Gets a unique asteroid position for the player in the given world.
   * @param world The World contract address.
   * @param playerEntity The entity ID of the player.
   * @return position The unique position (Coord) for the asteroid.
   */
  function getUniqueAsteroidPosition(IWorld world, uint256 playerEntity) internal view returns (Coord memory position) {
    // Get the ActiveComponent to check for active positions.
    ActiveComponent activeComponent = ActiveComponent(world.getComponent(ActiveComponentID));
    // This ensures no overflow when nonce increases by 1.
    uint256 nonce = uint32(playerEntity);
    bool found = false;
    do {
      position = LibEncode.decodeCoord(LibEncode.hashEntity(nonce));

      if (!activeComponent.has(LibEncode.encodeCoord(position))) {
        found = true;
      } else {
        nonce = nonce + 1;
      }
    } while (!found);
  }
}
