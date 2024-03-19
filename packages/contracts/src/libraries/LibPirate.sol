// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// tables
import { P_RequiredResources, P_RequiredResourcesData, Home, P_IsUtility, P_UnitPrototypes, Asteroid, MaxResourceCount, ResourceCount, UnitCount, PirateAsteroidData, P_SpawnPirateAsteroid, P_SpawnPirateAsteroidData, PirateAsteroid, Spawned, ReversePosition, OwnedBy, Position, PositionData } from "codegen/index.sol";

// types
import { EResource } from "src/Types.sol";
import { PirateKey } from "src/Keys.sol";
// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";

/**
 * @title LibPirate
 * @dev Library to handle pirate asteroid operations in a game, including creation and resource allocation.
 */
library LibPirate {
  /**
   * @notice Spawns a new pirate asteroid for a player in the game world.
   * @param playerEntity The identifier of the player for whom the pirate asteroid is spawned.
   * @param prototype The identifier of the prototype based on which the pirate asteroid is spawned.
   * @return asteroidEntity The unique identifier of the newly spawned pirate asteroid.
   * @dev This function handles the creation and setup of a pirate asteroid, including positioning, resource allocation, and unit assignment.
   */
  function createPirateAsteroid(bytes32 playerEntity, bytes32 prototype) internal returns (bytes32 asteroidEntity) {
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroid.get(prototype);
    bytes32 ownerEntity = LibEncode.getHash(PirateKey, playerEntity);
    asteroidEntity = LibEncode.getHash(ownerEntity);
    PositionData memory playerHomeAsteroidCoord = Position.get(Home.get(playerEntity));
    if (Spawned.get(ownerEntity)) {
      PositionData memory lastCoord = Position.get(asteroidEntity);
      ReversePosition.deleteRecord(lastCoord.x, lastCoord.y);
      Position.deleteRecord(asteroidEntity);
      bytes32[] memory units = P_UnitPrototypes.get();
      for (uint8 i = 0; i < units.length; i++) {
        LibUnit.decreaseUnitCount(asteroidEntity, units[i], UnitCount.get(asteroidEntity, units[i]), true);
      }
    } else {
      Home.set(ownerEntity, asteroidEntity);
    }

    PositionData memory coord = PositionData({
      x: playerHomeAsteroidCoord.x + spawnPirateAsteroid.x,
      y: playerHomeAsteroidCoord.y + spawnPirateAsteroid.y,
      parentEntity: 0
    });

    PirateAsteroid.set(
      asteroidEntity,
      PirateAsteroidData({
        isPirateAsteroid: true,
        isDefeated: false,
        prototype: prototype,
        playerEntity: playerEntity
      })
    );
    Position.set(asteroidEntity, coord);
    Asteroid.setIsAsteroid(asteroidEntity, true);
    Spawned.set(ownerEntity, true);
    ReversePosition.set(coord.x, coord.y, asteroidEntity);
    OwnedBy.set(asteroidEntity, ownerEntity);

    for (uint8 i = 0; i < spawnPirateAsteroid.resources.length; i++) {
      uint8 resource = spawnPirateAsteroid.resources[i];
      uint256 amount = spawnPirateAsteroid.resourceAmounts[i];
      increaseResource(asteroidEntity, resource, amount);
    }

    for (uint8 i = 0; i < spawnPirateAsteroid.units.length; i++) {
      bytes32 unit = spawnPirateAsteroid.units[i];
      uint256 amount = spawnPirateAsteroid.unitAmounts[i];
      P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(unit, 0);
      for (uint8 j = 0; j < requiredResources.resources.length; j++) {
        uint8 resource = requiredResources.resources[j];
        if (P_IsUtility.get(resource))
          increaseResource(asteroidEntity, resource, requiredResources.amounts[j] * amount);
      }
      LibUnit.increaseUnitCount(asteroidEntity, unit, amount, true);
    }
  }

  /**
   * @notice Increases a specific type of resource on an asteroid.
   * @param asteroidEntity The identifier of the asteroid on which the resource is to be increased.
   * @param resourceType The type of the resource to increase.
   * @param count The amount by which to increase the resource.
   * @dev This function handles the logic to increase either utility or storage resources on an asteroid.
   */
  function increaseResource(bytes32 asteroidEntity, uint8 resourceType, uint256 count) internal {
    if (P_IsUtility.get(resourceType)) {
      if (ResourceCount.get(asteroidEntity, resourceType) < count)
        LibProduction.increaseResourceProduction(
          asteroidEntity,
          EResource(resourceType),
          count - ResourceCount.get(asteroidEntity, resourceType)
        );
    } else {
      if (MaxResourceCount.get(asteroidEntity, resourceType) < count + ResourceCount.get(asteroidEntity, resourceType))
        LibStorage.increaseMaxStorage(
          asteroidEntity,
          resourceType,
          count + ResourceCount.get(asteroidEntity, resourceType) - MaxResourceCount.get(asteroidEntity, resourceType)
        );
      LibStorage.increaseStoredResource(asteroidEntity, resourceType, count);
    }
  }
}
