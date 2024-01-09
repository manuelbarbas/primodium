// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";

// tables
import { Spawned, ReversePosition, OwnedBy, Asteroid, AsteroidData, Position, PositionData, AsteroidCount, Asteroid, PositionData, P_GameConfigData, P_GameConfig } from "codegen/index.sol";

// libraries
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { EBuilding } from "src/Types.sol";

library LibAsteroid {
  /// @notice Creates new asteroid for player in world
  /// @notice Checks if asteroid already exists, sets position and other properties
  /// @param ownerEntity Owner's entity ID
  /// @return asteroidEntity Created asteroid's entity ID
  function createPrimaryAsteroid(bytes32 ownerEntity) internal returns (bytes32 asteroidEntity) {
    asteroidEntity = LibEncode.getHash(ownerEntity);
    require(!Asteroid.getIsAsteroid(asteroidEntity), "[LibAsteroid] asteroid already exists");

    uint256 asteroidCount = AsteroidCount.get() + 1;
    PositionData memory coord = getUniqueAsteroidPosition(asteroidCount);

    Position.set(asteroidEntity, coord);
    Asteroid.set(asteroidEntity, AsteroidData({ isAsteroid: true, maxLevel: 8, mapId: 1, spawnsSecondary: true }));
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

  /// @notice Create a new asteroid at a position
  /// @param position Position to place the asteroid
  /// @return asteroidSeed Hash of the newly created asteroid
  function createSecondaryAsteroid(bytes32 playerEntity, PositionData memory position) internal returns (bytes32) {
    P_GameConfigData memory config = P_GameConfig.get();
    for (uint256 i = 0; i < config.maxAsteroidsPerPlayer; i++) {
      PositionData memory sourcePosition = getPosition(i, config.asteroidDistance, config.maxAsteroidsPerPlayer);
      sourcePosition.x += position.x;
      sourcePosition.y += position.y;
      bytes32 sourceAsteroid = ReversePosition.get(sourcePosition.x, sourcePosition.y);
      if (sourceAsteroid == 0) continue;
      if (!Asteroid.getSpawnsSecondary(sourceAsteroid)) continue;
      bytes32 asteroidSeed = keccak256(abi.encode(sourceAsteroid, bytes32("asteroid"), position.x, position.y));
      if (!isAsteroid(asteroidSeed, config.asteroidChanceInv)) continue;
      initSecondaryAsteroid(playerEntity, position, asteroidSeed);

      return asteroidSeed;
    }
    revert("no asteroid found");
  }

  function getAsteroidData(bytes32 asteroidEntity, bool spawnsSecondary) internal view returns (AsteroidData memory) {
    // number between 1 and 5
    uint256 maxLevel = (LibEncode.getByteUInt(uint256(asteroidEntity), 3, 12) % 4) + 1;
    // number between 2 and 6
    uint8 mapId = uint8((LibEncode.getByteUInt(uint256(asteroidEntity), 3, 20) % 4) + 2);
    return AsteroidData({ isAsteroid: true, maxLevel: maxLevel, mapId: mapId, spawnsSecondary: spawnsSecondary });
  }

  function isAsteroid(bytes32 entity, uint256 chanceInv) internal pure returns (bool) {
    uint256 motherlodeKey = LibEncode.getByteUInt(uint256(entity), 6, 128);
    return motherlodeKey % chanceInv == 1;
  }

  /// @dev Initialize a motherlode
  /// @param position Position to place the motherlode
  /// @param asteroidEntity Hash of the asteroid to be initialized
  function initSecondaryAsteroid(
    bytes32 playerEntity,
    PositionData memory position,
    bytes32 asteroidEntity
  ) internal {
    AsteroidData memory data = getAsteroidData(asteroidEntity, false);
    Asteroid.set(asteroidEntity, data);
    Position.set(asteroidEntity, position);
    ReversePosition.set(position.x, position.y, asteroidEntity);

    // remove the next three lines once capital ships and invasions are built
    PositionData memory mainBasePosition = Position.get(MainBasePrototypeId);
    mainBasePosition.parent = asteroidEntity;
    LibBuilding.build(playerEntity, MainBasePrototypeId, mainBasePosition);
  }

  /// @dev Calculates position based on distance and max index
  /// @param i Index
  /// @param distance Distance
  /// @param max Max index
  /// @return position
  function getPosition(
    uint256 i,
    uint256 distance,
    uint256 max
  ) internal pure returns (PositionData memory) {
    return LibMath.getPositionByVector(distance, (i * 360) / max);
  }
}
