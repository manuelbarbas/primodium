// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Position, PositionData, LastConquered, ConquestAsteroid, P_ConquestConfig, ConquestAsteroidData, ReversePosition } from "codegen/index.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { EResource } from "src/Types.sol";

library LibConquestAsteroid {
  function createConquestAsteroid(uint256 asteroidCount) internal {
    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(asteroidCount));
    uint256 distance = LibMath.getSpawnDistance(asteroidCount);

    ConquestAsteroid.set(
      asteroidEntity,
      ConquestAsteroidData({ isConquestAsteroid: true, distanceFromCenter: distance, spawnTime: block.timestamp })
    );

    LibStorage.increaseMaxStorage(
      asteroidEntity,
      uint8(EResource.R_Encryption),
      P_ConquestConfig.getConquestAsteroidEncryption()
    );
    LibProduction.increaseResourceProduction(
      asteroidEntity,
      EResource.R_Encryption,
      P_ConquestConfig.getConquestAsteroidEncryptionRegen()
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
    ConquestAsteroid.setSpawnTime(asteroidEntity, block.timestamp);
    ReversePosition.set(position.x, position.y, asteroidEntity);
  }
}
