// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Position, PositionData, LastConquered, ConquestAsteroid, ConquestAsteroidData, ReversePosition } from "codegen/index.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

library LibConquestAsteroid {
  function createConquestAsteroid(uint256 asteroidCount) internal {
    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(asteroidCount));
    uint256 distance = LibMath.getSpawnDistance(asteroidCount);

    ConquestAsteroid.set(
      asteroidEntity,
      ConquestAsteroidData({ isConquestAsteroid: true, distanceFromCenter: distance })
    );

    spawnConquestAsteroid(asteroidEntity);
  }

  function spawnConquestAsteroid(bytes32 asteroidEntity) internal {
    uint256 distance = ConquestAsteroid.getDistanceFromCenter(asteroidEntity);

    LastConquered.set(asteroidEntity, block.timestamp);
    PositionData memory position;
    uint256 seed = uint256(asteroidEntity);
    do {
      position = LibMath.getPositionByVector(distance, LibMath.getRandomDirection(seed));
      seed++;
    } while (ReversePosition.get(position.x, position.y) != 0);
    Position.set(asteroidEntity, position);
    ReversePosition.set(position.x, position.y, asteroidEntity);
  }
}
