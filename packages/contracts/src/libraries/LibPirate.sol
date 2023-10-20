// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// tables
import { Home, P_IsUtility, P_UnitPrototypes, MaxResourceCount, ResourceCount, UnitCount, PirateAsteroidData, P_SpawnPirateAsteroid, P_SpawnPirateAsteroidData, PirateAsteroid, DefeatedPirate, Spawned, ReversePosition, OwnedBy, Position, PositionData, AsteroidCount, RockType, PositionData } from "codegen/index.sol";

// types
import { ERock, EResource } from "src/Types.sol";
import { PirateKey } from "src/Keys.sol";
// libraries
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibProduction } from "libraries/LibProduction.sol";

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
    PositionData memory playerHomeAsteroidCoord = Position.get(Home.get(playerEntity).asteroid);
    if (Spawned.get(ownerEntity)) {
      PositionData memory lastCoord = Position.get(asteroidEntity);
      ReversePosition.deleteRecord(lastCoord.x, lastCoord.y);
      Position.deleteRecord(asteroidEntity);
      bytes32[] memory units = P_UnitPrototypes.get();
      for (uint8 i = 0; i < units.length; i++) {
        LibUnit.updateStoredUtilities(
          ownerEntity,
          units[i],
          UnitCount.get(ownerEntity, asteroidEntity, units[i]),
          false
        );
        UnitCount.set(ownerEntity, asteroidEntity, units[i], 0);
      }
    } else {
      Home.setAsteroid(ownerEntity, asteroidEntity);
      uint8 resourceCount = uint8(EResource.LENGTH);
      for (uint8 i = 1; i < resourceCount; i++) {
        if (P_IsUtility.get(i)) {
          LibProduction.increaseResourceProduction(ownerEntity, EResource(i), 100000000);
        } else {
          MaxResourceCount.set(ownerEntity, i, 100000000);
        }
      }
    }
    PositionData memory coord = PositionData({
      x: playerHomeAsteroidCoord.x + spawnPirateAsteroid.x,
      y: playerHomeAsteroidCoord.y + spawnPirateAsteroid.y,
      parent: 0
    });

    Position.set(asteroidEntity, coord);
    RockType.set(asteroidEntity, uint8(ERock.Asteroid));
    Spawned.set(ownerEntity, true);
    ReversePosition.set(coord.x, coord.y, asteroidEntity);
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
      LibUnit.updateStoredUtilities(ownerEntity, unit, amount, true);
    }
  }
}
