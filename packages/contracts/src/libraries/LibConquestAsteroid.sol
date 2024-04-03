// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { FleetMovement, OwnedBy, ResourceCount, Position, PositionData, LastConquered, ConquestAsteroid, P_ConquestConfig, ConquestAsteroidData, ReversePosition } from "codegen/index.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibScore } from "libraries/LibScore.sol";
import { LibFleetClear } from "libraries/fleet/LibFleetClear.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { EResource, EScoreType } from "src/Types.sol";
import { FleetIncomingKey, FleetOutgoingKey } from "src/Keys.sol";

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

  function explodeConquestAsteroid(bytes32 asteroidEntity) internal {
    // add score to owner and remove owner
    bytes32 owner = OwnedBy.get(asteroidEntity);
    if (!owner) return;

    // kill all incoming and orbiting fleets
    bytes32[] memory incomingFleetEntities = FleetSet.getFleetEntities(FleetIncomingKey, asteroidEntity);
    for (uint i = 0; i < incomingFleetEntities.length; i++) {
      LibFleetClear.abandonFleet(incomingFleetEntities[i]);
    }
    FleetSet.clear(FleetIncomingKey, asteroidEntity);

    // kill all outgoing fleets
    bytes32[] memory outgoingFleetEntities = FleetSet.getFleetEntities(FleetOutgoingKey, asteroidEntity);
    for (uint i = 0; i < outgoingFleetEntities.length; i++) {
      // only kill if fleet hasn't arrived yet
      if (FleetMovement.getArrivalTime(outgoingFleetEntities[i]) > block.timestamp)
        LibFleetClear.abandonFleet(outgoingFleetEntities[i]);
    }
    FleetSet.clear(FleetOutgoingKey, asteroidEntity);

    // reset encryption
    ResourceCount.set(asteroidEntity, uint8(EResource.R_Encryption), P_ConquestConfig.getConquestAsteroidEncryption());

    // respawn in a new location
    spawnConquestAsteroid(asteroidEntity);
  }
}
