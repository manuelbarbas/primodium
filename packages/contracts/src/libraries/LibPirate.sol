// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// tables
import { P_UnitPrototypes, MaxResourceCount, ResourceCount, UnitCount, PirateAsteroidData, P_SpawnPirateAsteroid, P_SpawnPirateAsteroidData, PirateAsteroid, DefeatedPirate, Spawned, ReversePosition, OwnedBy, Position, PositionData, AsteroidCount, RockType, PositionData } from "codegen/index.sol";

// types
import { ERock, EResource } from "src/Types.sol";
import { PirateKey } from "src/Keys.sol";
// libraries
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Trigonometry as Trig } from "trig/src/Trigonometry.sol";
import { ABDKMath64x64 as Math } from "abdk/ABDKMath64x64.sol";

library LibPirate {
  /// @notice spawns new pirate asteroid for player in world
  /// @param prototype the prototype which has spawned the asteroid
  /// @param playerEntity the player the pirate asteroid is spawned for
  /// @return asteroidEntity the entity ID of the spawned asteroid
  function createPirateAsteroid(bytes32 playerEntity, bytes32 prototype) internal returns (bytes32 asteroidEntity) {
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroid.get(prototype);
    bytes32 ownerEntity = LibEncode.getHash(PirateKey, playerEntity);
    asteroidEntity = LibEncode.getHash(ownerEntity);

    if (Spawned.get(asteroidEntity)) {
      PositionData memory Pos = Position.get(asteroidEntity);
      ReversePosition.deleteRecord(Pos.x, Pos.y);
      Position.deleteRecord(asteroidEntity);
      bytes32[] memory units = P_UnitPrototypes.get();
      for (uint8 i = 0; i < units.length; i++) {
        UnitCount.deleteRecord(ownerEntity, asteroidEntity, units[i]);
      }
    } else {
      uint8 resourceCount = uint8(EResource.LENGTH);
      for (uint8 i = 1; i < resourceCount; i++) {
        MaxResourceCount.set(ownerEntity, i, 100000000);
      }
    }
    PositionData memory position = PositionData({ x: spawnPirateAsteroid.x, y: spawnPirateAsteroid.y, parent: 0 });

    Position.set(asteroidEntity, position);
    RockType.set(asteroidEntity, uint8(ERock.Asteroid));
    Spawned.set(ownerEntity, true);
    ReversePosition.set(position.x, position.y, asteroidEntity);
    OwnedBy.set(asteroidEntity, ownerEntity);
    PirateAsteroid.set(asteroidEntity, PirateAsteroidData({ prototype: prototype, playerEntity: playerEntity }));

    for (uint8 i = 0; i < spawnPirateAsteroid.resources.length; i++) {
      uint8 resource = spawnPirateAsteroid.resources[i];
      uint256 amount = spawnPirateAsteroid.resourceAmounts[i];
      ResourceCount.set(ownerEntity, resource, ResourceCount.get(ownerEntity, resource) + amount);
    }

    for (uint8 i = 0; i < spawnPirateAsteroid.units.length; i++) {
      bytes32 unit = spawnPirateAsteroid.units[i];
      uint256 amount = spawnPirateAsteroid.unitAmounts[i];
      UnitCount.set(ownerEntity, asteroidEntity, unit, UnitCount.get(ownerEntity, asteroidEntity, unit) + amount);
    }
  }

  /// @notice Generates unique asteroid position
  /// @notice Ensures asteroid positions do not overlap
  /// @return position Generated unique position
  function getUniqueAsteroidPosition(uint256 asteroidCount) internal view returns (PositionData memory position) {
    position = LibMath.getPositionByVector(
      LibMath.getSpawnDistance(asteroidCount),
      LibMath.getSpawnDirection(asteroidCount)
    );
    while (ReversePosition.get(position.x, position.y) != 0) {
      position.y += 5;
    }
  }
}
