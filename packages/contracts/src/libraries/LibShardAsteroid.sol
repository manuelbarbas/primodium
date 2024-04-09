// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ShardAsteroidIndex, FleetMovement, OwnedBy, ResourceCount, Position, PositionData, LastConquered, ShardAsteroid, P_ConquestConfig, ShardAsteroidData, ReversePosition } from "codegen/index.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibScore } from "libraries/LibScore.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibFleetClear } from "libraries/fleet/LibFleetClear.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { EResource, EScoreType } from "src/Types.sol";
import { FleetIncomingKey, FleetOutgoingKey } from "src/Keys.sol";

library LibShardAsteroid {
  function createShardAsteroid(uint256 asteroidCount, uint256 asteroidConquestIndex) internal {
    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("shardAsteroid"), bytes32(asteroidCount));
    uint256 distance = LibMath.getSpawnDistance(asteroidCount);

    ShardAsteroid.set(
      asteroidEntity,
      ShardAsteroidData({ isShardAsteroid: true, distanceFromCenter: distance, spawnTime: block.timestamp })
    );
    ShardAsteroidIndex.set(asteroidEntity, asteroidConquestIndex);

    LibStorage.increaseMaxStorage(
      asteroidEntity,
      uint8(EResource.R_Encryption),
      P_ConquestConfig.getShardAsteroidEncryption()
    );
    LibProduction.increaseResourceProduction(
      asteroidEntity,
      EResource.R_Encryption,
      P_ConquestConfig.getShardAsteroidEncryptionRegen()
    );

    spawnShardAsteroid(asteroidEntity);
  }

  function spawnShardAsteroid(bytes32 asteroidEntity) internal {
    uint256 distance = ShardAsteroid.getDistanceFromCenter(asteroidEntity);

    LastConquered.set(asteroidEntity, block.timestamp);
    PositionData memory prevPosition = Position.get(asteroidEntity);
    PositionData memory position;
    uint256 seed = uint256(asteroidEntity);
    do {
      position = LibMath.getPositionByVector(distance, LibMath.getRandomDirection(seed));
      seed++;
    } while (ReversePosition.get(position.x, position.y) != 0 || getQuadrant(position) == getQuadrant(prevPosition));
    Position.set(asteroidEntity, position);
    ShardAsteroid.setSpawnTime(asteroidEntity, block.timestamp);
    ReversePosition.set(position.x, position.y, asteroidEntity);
  }

  function getQuadrant(PositionData memory position) internal pure returns (uint8) {
    if (position.x > 0 && position.y > 0) {
      return 1; // Quadrant 1
    } else if (position.x < 0 && position.y > 0) {
      return 2; // Quadrant 2
    } else if (position.x < 0 && position.y < 0) {
      return 3; // Quadrant 3
    } else if (position.x > 0 && position.y < 0) {
      return 4; // Quadrant 4
    } else {
      return 0; // Position is on an axis or origin, not in any quadrant
    }
  }

  function explodeShardAsteroid(bytes32 asteroidEntity) internal {
    bytes32 ownerEntity = OwnedBy.get(asteroidEntity);
    if (ownerEntity != 0) {
      LibAsteroid.removeAsteroidOwner(asteroidEntity, ownerEntity);
      LibScore.addScore(ownerEntity, EScoreType.Conquest, P_ConquestConfig.getShardAsteroidPoints());
    }

    // kill all incoming and orbiting fleets
    bytes32[] memory incomingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetIncomingKey);
    for (uint i = 0; i < incomingFleetEntities.length; i++) {
      LibFleetClear.abandonFleet(incomingFleetEntities[i]);
    }
    FleetSet.clear(asteroidEntity, FleetIncomingKey);

    // kill all outgoing fleets
    bytes32[] memory outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);
    for (uint i = 0; i < outgoingFleetEntities.length; i++) {
      // only kill if fleet hasn't arrived yet
      if (FleetMovement.getArrivalTime(outgoingFleetEntities[i]) > block.timestamp)
        LibFleetClear.abandonFleet(outgoingFleetEntities[i]);
    }
    FleetSet.clear(asteroidEntity, FleetOutgoingKey);

    // reset encryption
    ResourceCount.set(asteroidEntity, uint8(EResource.R_Encryption), P_ConquestConfig.getShardAsteroidEncryption());

    // respawn in a new location
    spawnShardAsteroid(asteroidEntity);
  }
}
