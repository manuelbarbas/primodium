// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { entityToAddress } from "src/utils.sol";
// tables
import { TilePositions, IsActive, HasBuiltBuilding, Asteroid, P_UnitProdTypes, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, OwnedBy, P_Blueprint } from "codegen/index.sol";

// libraries
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource } from "src/Types.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

library LibBuilding {
  /**
   * @dev gets a unique building entity ID from a coordinate.
   * @param coord The coordinate of the building to be destroyed.
   */
  function getUniqueBuildingEntity(PositionData memory coord) internal view returns (bytes32) {
    return LibEncode.getTimedHash(BuildingKey, coord);
  }

  /**
   * @dev Checks if the requirements for destroying a building are met.
   * @param playerEntity The entity ID of the player.
   * @param buildingEntity The the building to be destroyed.
   */
  function checkDestroyRequirements(bytes32 playerEntity, bytes32 buildingEntity) internal view {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);

    require(buildingPrototype != MainBasePrototypeId, "[Destroy] Cannot destroy main base");
    require(
      OwnedBy.get(Position.getParentEntity(buildingEntity)) == playerEntity,
      "[Destroy] Only owner can destroy building"
    );
  }

  /**
   * @dev Checks if the requirements for building a new building are met.
   * @param playerEntity The entity ID of the player.
   * @param buildingPrototype The type of building to be constructed.
   * @param coord The coordinate where the building should be placed.
   */
  function checkBuildRequirements(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    PositionData memory coord
  ) internal view {
    require(Spawned.get(playerEntity), "[BuildSystem] Player has not spawned");
    if (buildingPrototype == MainBasePrototypeId) {
      require(
        Home.get(coord.parentEntity) == bytes32(0),
        "[BuildSystem] Cannot build more than one main base per asteroid"
      );
    }
    require(
      OwnedBy.get(coord.parentEntity) == playerEntity,
      "[BuildSystem] You can only build on an asteroid you control"
    );
    require(
      LibBuilding.hasRequiredBaseLevel(coord.parentEntity, buildingPrototype, 1),
      "[BuildSystem] MainBase level requirement not met"
    );
    require(LibBuilding.canBuildOnTile(buildingPrototype, coord), "[BuildSystem] Cannot build on this tile");
  }

  /**
   * @dev Checks if the requirements for building a new building are met.
   * @param playerEntity The entity ID of the player.
   * @param buildingEntity The building to be placed.
   */
  function checkUpgradeRequirements(bytes32 playerEntity, bytes32 buildingEntity) internal view {
    bytes32 asteroidEntity = Position.getParentEntity(buildingEntity);
    require(buildingEntity != 0, "[UpgradeBuildingSystem] no building at this coordinate");

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    require(targetLevel > 1, "[UpgradeBuildingSystem] Cannot upgrade a non-building");
    require(
      OwnedBy.get(asteroidEntity) == playerEntity,
      "[UpgradeBuildingSystem] Cannot upgrade a building that is not owned by you"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint256 maxLevel = P_MaxLevel.get(buildingPrototype);
    require((targetLevel <= maxLevel), "[UpgradeBuildingSystem] Building has reached max level");

    require(
      LibBuilding.hasRequiredBaseLevel(asteroidEntity, buildingPrototype, targetLevel),
      "[UpgradeBuildingSystem] MainBase level requirement not met"
    );
  }

  /// @notice Builds a building at a specified coordinate
  /// @param playerEntity The entity ID of the player
  /// @param buildingPrototype The type of building to construct
  /// @param coord The coordinate where the building should be placed
  /// @return buildingEntity The entity ID of the newly constructed building
  function build(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    PositionData memory coord
  ) internal returns (bytes32 buildingEntity) {
    checkBuildRequirements(playerEntity, buildingPrototype, coord);
    buildingEntity = LibEncode.getTimedHash(BuildingKey, coord);

    Spawned.set(buildingEntity, true);
    BuildingType.set(buildingEntity, buildingPrototype);
    Position.set(buildingEntity, coord);
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    OwnedBy.set(buildingEntity, coord.parentEntity);
    HasBuiltBuilding.set(playerEntity, buildingPrototype, true);
    HasBuiltBuilding.set(coord.parentEntity, buildingPrototype, true);
    IsActive.set(buildingEntity, true);
    if (buildingPrototype == MainBasePrototypeId) {
      Home.set(coord.parentEntity, buildingEntity);
    }
    if (P_UnitProdTypes.length(buildingPrototype, 1) != 0) {
      UnitFactorySet.add(coord.parentEntity, buildingEntity);
    }
    placeBuildingTiles(buildingEntity, buildingPrototype, coord);
  }

  /// @notice Places building tiles for a constructed building
  /// @param buildingEntity The entity ID of the building
  /// @param buildingPrototype The type of building to construct
  /// @param position The coordinate where the building should be placed
  function placeBuildingTiles(
    bytes32 buildingEntity,
    bytes32 buildingPrototype,
    PositionData memory position
  ) internal {
    int32[] memory blueprint = P_Blueprint.get(buildingPrototype);
    Bounds memory bounds = getAsteroidBounds(position.parentEntity);

    int32[] memory tileCoords = new int32[](blueprint.length);
    for (uint256 i = 0; i < blueprint.length; i += 2) {
      int32 x = blueprint[i] + position.x;
      int32 y = blueprint[i + 1] + position.y;
      require(
        bounds.minX <= x && bounds.minY <= y && bounds.maxX >= x && bounds.maxY >= y,
        "[BuildSystem] Building out of bounds"
      );
      tileCoords[i] = x;
      tileCoords[i + 1] = y;
    }

    require(LibAsteroid.allTilesAvailable(position.parentEntity, tileCoords), "[BuildSystem] Tile unavailable");
    LibAsteroid.setTiles(position.parentEntity, tileCoords);
    TilePositions.set(buildingEntity, tileCoords);
  }

  function removeBuildingTiles(bytes32 buildingEntity) internal {
    LibAsteroid.removeTiles(Position.getParentEntity(buildingEntity), TilePositions.get(buildingEntity));
    TilePositions.deleteRecord(buildingEntity);
  }

  /// @notice Gets the boundary limits for a asteroid
  /// @param asteroidEntity The entity ID of the asteroid
  /// @return bounds The boundary limits
  function getAsteroidBounds(bytes32 asteroidEntity) internal view returns (Bounds memory bounds) {
    uint256 asteroidLevel = Level.get(asteroidEntity);
    P_AsteroidData memory asteroidDims = P_Asteroid.get();
    DimensionsData memory range = Dimensions.get(ExpansionKey, asteroidLevel);

    return
      Bounds({
        maxX: (asteroidDims.xBounds + range.width) / 2 - 1,
        maxY: (asteroidDims.yBounds + range.height) / 2 - 1,
        minX: (asteroidDims.xBounds - range.width) / 2,
        minY: (asteroidDims.yBounds - range.height) / 2
      });
  }

  /// @notice Gets the base level for a player
  /// @param asteroidEntity The entity ID of the asteroid
  /// @return The base level
  function getBaseLevel(bytes32 asteroidEntity) internal view returns (uint256) {
    bytes32 mainBase = Home.get(asteroidEntity);
    return Level.get(mainBase);
  }

  /// @notice Checks if a player meets the base level requirements to build a building
  /// @param asteroidEntity The entity ID of the asteroid
  /// @param prototype The type of building
  /// @param level The level of the building
  /// @return True if requirements are met, false otherwise
  function hasRequiredBaseLevel(bytes32 asteroidEntity, bytes32 prototype, uint256 level) internal view returns (bool) {
    uint256 mainLevel = getBaseLevel(asteroidEntity);
    return mainLevel >= P_RequiredBaseLevel.get(prototype, level);
  }

  /// @notice Checks if a building can be constructed on a specific tile
  /// @param prototype The type of building
  /// @param coord The coordinate to check
  /// @return True if the building's required terrain matches the terrain of the given coord
  function canBuildOnTile(bytes32 prototype, PositionData memory coord) internal view returns (bool) {
    EResource resource = EResource(P_RequiredTile.get(prototype));
    uint8 mapId = Asteroid.getMapId(coord.parentEntity);
    return resource == EResource.NULL || uint8(resource) == P_Terrain.get(mapId, coord.x, coord.y);
  }
}
