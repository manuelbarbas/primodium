// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// tables
import { Spawned, ReversePosition, OwnedBy, Position, PositionData, AsteroidCount, RockType, PositionData } from "codegen/index.sol";

// types
import { ERock } from "src/Types.sol";

// libraries
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

library LibAsteroid {
  /// @notice Creates new asteroid for player in world
  /// @notice Checks if asteroid already exists, sets position and other properties
  /// @param ownerEntity Owner's entity ID
  /// @return asteroidEntity Created asteroid's entity ID
  function createAsteroid(bytes32 ownerEntity) internal returns (bytes32 asteroidEntity) {
    asteroidEntity = LibEncode.getHash(ownerEntity);
    require(RockType.get(asteroidEntity) == uint8(ERock.NULL), "[LibAsteroid] asteroid already exists");

    uint256 asteroidCount = AsteroidCount.get() + 1;
    PositionData memory coord = getUniqueAsteroidPosition(asteroidCount);

    Position.set(asteroidEntity, coord);
    RockType.set(asteroidEntity, uint8(ERock.Asteroid));
    Spawned.set(ownerEntity, true);
    ReversePosition.set(coord.x, coord.y, asteroidEntity);
    OwnedBy.set(asteroidEntity, ownerEntity);
    AsteroidCount.set(asteroidCount);
  }

  /// @notice Generates unique asteroid coord
  /// @notice Ensures asteroid coords do not overlap
  /// @return coord Generated unique coord
  function getUniqueAsteroidPosition(uint256 asteroidCount) internal view returns (PositionData memory coord) {
    coord = LibMath.getPositionByVector(
      LibMath.getSpawnDistance(asteroidCount),
      LibMath.getSpawnDirection(asteroidCount)
    );
    while (ReversePosition.get(coord.x, coord.y) != 0) {
      coord.y += 5;
    }
  }
}
