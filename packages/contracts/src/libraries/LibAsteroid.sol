// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AsteroidOwnedByKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";
import { DroidPrototypeId } from "codegen/Prototypes.sol";

// tables
import { LastConquered, UsedTiles, Dimensions, DimensionsData, P_MaxLevel, GracePeriod, P_GracePeriod, ReversePosition, Level, OwnedBy, Asteroid, UnitCount, AsteroidData, Position, PositionData, AsteroidCount, Asteroid, P_GameConfigData, P_GameConfig, P_WormholeAsteroidConfig, P_WormholeAsteroidConfigData } from "codegen/index.sol";

// libraries
import { ExpansionKey } from "src/Keys.sol";
import { AsteroidSet } from "src/libraries/AsteroidSet.sol";
import { EResource } from "src/Types.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";

library LibAsteroid {
  /// @notice Creates new asteroid for player in world
  /// @notice Checks if asteroid already exists, sets position and other properties
  /// @return asteroidEntity Created asteroid's entity ID
  function createPrimaryAsteroid(bytes32 ownerEntity) internal returns (bytes32 asteroidEntity) {
    asteroidEntity = LibEncode.getHash(ownerEntity);
    uint256 asteroidCount = AsteroidCount.get() + 1;
    PositionData memory coord = getUniqueAsteroidPosition(asteroidCount);

    asteroidEntity = LibEncode.getTimedHash(bytes32("asteroid"), coord);
    require(!Asteroid.getIsAsteroid(asteroidEntity), "[LibAsteroid] asteroid already exists");
    uint256 gracePeriodLength = (P_GracePeriod.getAsteroid() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    GracePeriod.set(asteroidEntity, block.timestamp + gracePeriodLength);

    Level.set(asteroidEntity, 1);
    Position.set(asteroidEntity, coord);
    Asteroid.set(
      asteroidEntity,
      AsteroidData({
        isAsteroid: true,
        maxLevel: 5,
        mapId: 1,
        spawnsSecondary: true,
        wormhole: false,
        conquestPoints: 0
      })
    );
    ReversePosition.set(coord.x, coord.y, asteroidEntity);

    UsedTiles.set(asteroidEntity, new uint256[](getUsedTilesLength()));

    LibProduction.increaseResourceProduction(asteroidEntity, EResource.U_MaxFleets, 1);
    AsteroidCount.set(asteroidCount);
  }

  function getUsedTilesLength() private view returns (uint256) {
    DimensionsData memory dimensions = Dimensions.get(ExpansionKey, P_MaxLevel.get(ExpansionKey));
    return ((uint256(uint32(dimensions.width * dimensions.height))) / 256) + 1;
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
  /// @dev if the slot is the wormhole asteroid slot, it will always create a wormhole asteroid
  /// @param position Position to place the asteroid
  /// @return asteroidSeed Hash of the newly created asteroid
  function createSecondaryAsteroid(PositionData memory position) internal returns (bytes32) {
    P_GameConfigData memory config = P_GameConfig.get();
    uint256 wormholeSlot = P_WormholeAsteroidConfig.getWormholeAsteroidSlot();
    for (uint256 i = 0; i < config.maxAsteroidsPerPlayer; i++) {
      PositionData memory sourcePosition = getPosition(i, config.asteroidDistance, config.maxAsteroidsPerPlayer);
      sourcePosition.x += position.x;
      sourcePosition.y += position.y;
      bytes32 sourceAsteroidEntity = ReversePosition.get(sourcePosition.x, sourcePosition.y);
      if (sourceAsteroidEntity == 0) continue;
      if (!Asteroid.getSpawnsSecondary(sourceAsteroidEntity)) continue;
      bytes32 asteroidSeed = keccak256(abi.encode(sourceAsteroidEntity, bytes32("asteroid"), position.x, position.y));

      bool isWormholeAsteroidSlot = i == wormholeSlot;
      if (!isWormholeAsteroidSlot && !isAsteroid(asteroidSeed, config.asteroidChanceInv, i)) continue;
      initSecondaryAsteroid(position, asteroidSeed, isWormholeAsteroidSlot);

      return asteroidSeed;
    }
    revert("no asteroid found");
  }

  function getAsteroidData(
    bytes32 asteroidEntity,
    bool spawnsSecondary,
    bool wormholeAsteroid
  ) internal view returns (AsteroidData memory) {
    if (wormholeAsteroid) {
      P_WormholeAsteroidConfigData memory wormholeConfig = P_WormholeAsteroidConfig.get();
      return
        AsteroidData({
          isAsteroid: true,
          maxLevel: wormholeConfig.maxLevel,
          mapId: wormholeConfig.mapId,
          conquestPoints: wormholeConfig.conquestPoints,
          spawnsSecondary: spawnsSecondary,
          wormhole: true
        });
    }
    uint256 distributionVal = (LibEncode.getByteUInt(uint256(asteroidEntity), 7, 12) % 100);

    uint256 maxLevel;
    uint256 conquestPoints;
    //micro
    if (distributionVal <= 50) {
      maxLevel = 1;
      conquestPoints = 3;
      //small
    } else if (distributionVal <= 75) {
      maxLevel = 3;
      conquestPoints = 4;
      //medium
    } else if (distributionVal <= 90) {
      maxLevel = 5;
      conquestPoints = 5;
      //large
    } else {
      maxLevel = 8;
      conquestPoints = 1;
    }

    // number between 2 and 5
    uint8 mapId = uint8((LibEncode.getByteUInt(uint256(asteroidEntity), 3, 20) % 4) + 2);
    return
      AsteroidData({
        isAsteroid: true,
        maxLevel: maxLevel,
        mapId: mapId,
        spawnsSecondary: spawnsSecondary,
        wormhole: false,
        conquestPoints: conquestPoints
      });
  }

  function getSecondaryAsteroidUnitsAndEncryption(uint256 level) internal pure returns (uint256, uint256) {
    uint256 droidCount = 4 ** level + 100;
    uint256 encryption = (level * 10 + 10) * 1e18;
    return (droidCount, encryption);
  }

  function isAsteroid(bytes32 entity, uint256 chanceInv, uint256 asteroidSlot) internal view returns (bool) {
    if (asteroidSlot == P_WormholeAsteroidConfig.getWormholeAsteroidSlot()) return true;
    uint256 motherlodeKey = LibEncode.getByteUInt(uint256(entity), 6, 128);
    return motherlodeKey % chanceInv == 0;
  }

  /// @dev Initialize a motherlode
  /// @param position Position to place the motherlode
  /// @param asteroidEntity Hash of the asteroid to be initialized
  function initSecondaryAsteroid(PositionData memory position, bytes32 asteroidEntity, bool wormholeAsteroid) internal {
    AsteroidData memory data = getAsteroidData(asteroidEntity, false, wormholeAsteroid);
    Asteroid.set(asteroidEntity, data);
    Position.set(asteroidEntity, position);
    ReversePosition.set(position.x, position.y, asteroidEntity);
    Level.set(asteroidEntity, 1);
    UsedTiles.set(asteroidEntity, new uint256[](getUsedTilesLength()));

    (uint256 droidCount, uint256 encryption) = getSecondaryAsteroidUnitsAndEncryption(data.maxLevel);
    UnitCount.set(asteroidEntity, DroidPrototypeId, droidCount);
    LibStorage.increaseMaxStorage(asteroidEntity, uint8(EResource.R_Encryption), encryption);
  }

  function initAsteroidOwner(bytes32 asteroidEntity, bytes32 ownerEntity) internal {
    OwnedBy.set(asteroidEntity, ownerEntity);
    AsteroidSet.add(ownerEntity, AsteroidOwnedByKey, asteroidEntity);
    LastConquered.set(asteroidEntity, block.timestamp);
  }

  /// @dev Calculates position based on distance and max index
  /// @param i Index
  /// @param distance Distance
  /// @param max Max index
  /// @return position
  function getPosition(uint256 i, uint256 distance, uint256 max) internal pure returns (PositionData memory) {
    return LibMath.getPositionByVector(distance, (i * 360) / max);
  }

  /**
   * @dev Checks if all specified tiles are available.
   * @param asteroidEntity Identifier for a set of tiles.
   * @param coords Array of coordinates, structured as [x1, y1, x2, y2, ...]. Must be even length.
   * @return bool True if all specified tiles are available, false otherwise.
   * Requires coords length to be even. Returns true if no tiles are used for the given asteroid. Validates each tile's availability based on its position in a bitmap.
   */
  function allTilesAvailable(bytes32 asteroidEntity, int32[] memory coords) internal view returns (bool) {
    require(coords.length % 2 == 0, "Invalid coords length");
    uint256[] memory bitmap = UsedTiles.get(asteroidEntity);
    if (bitmap.length == 0) return true;

    int32 width = Dimensions.getWidth(ExpansionKey, P_MaxLevel.get(ExpansionKey));
    for (uint256 i = 0; i < coords.length; i += 2) {
      uint256 index = uint256(uint32(coords[i] * width + coords[i + 1]));
      uint256 wordIndex = index / 256;
      if (wordIndex >= bitmap.length) return false; // out of bounds (not available)
      uint256 bitIndex = index % 256;

      if ((bitmap[wordIndex] >> bitIndex) & 1 == 1) return false;
    }

    return true;
  }

  /**
   * @dev Marks specified tiles as used.
   * @param asteroidEntity Identifier for a set of tiles.
   * @param coords Array of coordinates, structured as [x1, y1, x2, y2, ...]. Must be even length.
   * Sets tiles as used in the bitmap for the given asteroid. Requires coords length to be even and tiles to be within bounds.
   */
  function setTiles(bytes32 asteroidEntity, int32[] memory coords) internal {
    require(coords.length % 2 == 0, "Invalid coords length");
    uint256[] memory bitmap = UsedTiles.get(asteroidEntity);

    int32 width = Dimensions.getWidth(ExpansionKey, P_MaxLevel.get(ExpansionKey));
    for (uint256 i = 0; i < coords.length; i += 2) {
      uint256 index = uint256(uint32(coords[i] * width + coords[i + 1]));
      uint256 wordIndex = index / 256;
      require(wordIndex < bitmap.length, "Tile out of bounds");
      uint256 bitIndex = index % 256;

      bitmap[wordIndex] |= (1 << bitIndex);
    }

    UsedTiles.set(asteroidEntity, bitmap);
  }

  /**
   * @dev Frees up specified tiles, marking them as unused.
   * @param asteroidEntity Identifier for a set of tiles.
   * @param coords Array of coordinates, structured as [x1, y1, x2, y2, ...]. Must be even length.
   * Clears tiles in the bitmap for the given asteroid. Requires coords length to be even and tiles to be within bounds.
   */
  function removeTiles(bytes32 asteroidEntity, int32[] memory coords) internal {
    require(coords.length % 2 == 0, "Invalid coords length");
    uint256[] memory bitmap = UsedTiles.get(asteroidEntity);

    int32 width = Dimensions.getWidth(ExpansionKey, P_MaxLevel.get(ExpansionKey));
    for (uint256 i = 0; i < coords.length; i += 2) {
      uint256 index = uint256(uint32(coords[i] * width + coords[i + 1]));
      uint256 wordIndex = index / 256;
      require(wordIndex < bitmap.length, "Tile out of bounds");
      uint256 bitIndex = index % 256;

      bitmap[wordIndex] &= ~(1 << bitIndex);
    }

    UsedTiles.set(asteroidEntity, bitmap);
  }
}
