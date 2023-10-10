// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
// tables
import { Home, P_RequiredTile, P_ProducesUnits, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";

import { S_ReduceProductionRateSystem } from "systems/subsystems/S_ReduceProductionRateSystem.sol";
import { S_ResourceProductionSystem } from "systems/subsystems/S_ResourceProductionSystem.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource } from "src/Types.sol";

library LibBuilding {
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
    buildingEntity = LibEncode.getHash(BuildingKey, coord);

    Position.set(buildingEntity, coord);
    Spawned.set(buildingEntity, true);
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    OwnedBy.set(buildingEntity, playerEntity);

    address playerAddress = entityToAddress(playerEntity);

    if (P_ProducesUnits.get(buildingPrototype)) {
      UnitFactorySet.add(playerEntity, buildingEntity);
    }
  }

  /// @notice Places building tiles for a constructed building
  /// @param playerEntity The entity ID of the player
  /// @param buildingPrototype The type of building to construct
  /// @param position The coordinate where the building should be placed
  function placeBuildingTiles(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    PositionData memory position
  ) public {
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, position);
    int32[] memory blueprint = P_Blueprint.get(buildingPrototype);
    Bounds memory bounds = getPlayerBounds(playerEntity);

    bytes32[] memory tiles = new bytes32[](blueprint.length / 2);
    for (uint256 i = 0; i < blueprint.length; i += 2) {
      PositionData memory relativeCoord = PositionData(blueprint[i], blueprint[i + 1], 0);
      PositionData memory absoluteCoord = PositionData(
        position.x + relativeCoord.x,
        position.y + relativeCoord.y,
        position.parent
      );
      tiles[i / 2] = placeBuildingTile(buildingEntity, bounds, absoluteCoord);
    }
    Children.set(buildingEntity, tiles);
  }

  /// @notice Places a single building tile at a coordinate
  /// @param buildingEntity The entity ID of the building
  /// @param bounds The boundary limits for placing the tile
  /// @param coord The coordinate where the tile should be placed
  /// @return tileEntity The entity ID of the newly placed tile
  function placeBuildingTile(
    bytes32 buildingEntity,
    Bounds memory bounds,
    PositionData memory coord
  ) private returns (bytes32 tileEntity) {
    tileEntity = LibEncode.getHash(BuildingTileKey, coord);
    require(OwnedBy.get(tileEntity) == 0, "[BuildSystem] Cannot build tile on a non-empty coordinate");
    require(
      bounds.minX <= coord.x && bounds.minY <= coord.y && bounds.maxX >= coord.x && bounds.maxY >= coord.y,
      "[BuildSystem] Building out of bounds"
    );
    OwnedBy.set(tileEntity, buildingEntity);
    Position.set(tileEntity, coord);
  }

  /// @notice Gets the boundary limits for a player
  /// @param playerEntity The entity ID of the player
  /// @return bounds The boundary limits
  function getPlayerBounds(bytes32 playerEntity) internal view returns (Bounds memory bounds) {
    uint256 playerLevel = Level.get(playerEntity);
    P_AsteroidData memory asteroidDims = P_Asteroid.get();
    DimensionsData memory range = Dimensions.get(ExpansionKey, playerLevel);

    return
      Bounds({
        maxX: (asteroidDims.xBounds + range.width) / 2 - 1,
        maxY: (asteroidDims.yBounds + range.height) / 2 - 1,
        minX: (asteroidDims.xBounds - range.width) / 2,
        minY: (asteroidDims.yBounds - range.height) / 2
      });
  }

  /// @notice Gets the building entity ID from a coordinate
  /// @param coord The coordinate to look up
  /// @return The building entity ID
  function getBuildingFromCoord(PositionData memory coord) internal view returns (bytes32) {
    bytes32 buildingTile = LibEncode.getHash(BuildingTileKey, coord);
    return OwnedBy.get(buildingTile);
  }

  /// @notice Gets the base level for a player
  /// @param playerEntity The entity ID of the player
  /// @return The base level
  function getBaseLevel(bytes32 playerEntity) internal view returns (uint256) {
    if (!Spawned.get(playerEntity)) return 0;
    bytes32 mainBase = Home.getMainBase(playerEntity);
    return Level.get(mainBase);
  }

  /// @notice Checks if a player meets the base level requirements to build a building
  /// @param playerEntity The entity ID of the player
  /// @param prototype The type of building
  /// @param level The level of the building
  /// @return True if requirements are met, false otherwise
  function hasRequiredBaseLevel(
    bytes32 playerEntity,
    bytes32 prototype,
    uint256 level
  ) internal view returns (bool) {
    uint256 mainLevel = getBaseLevel(playerEntity);
    return mainLevel >= P_RequiredBaseLevel.get(prototype, level);
  }

  /// @notice Checks if a building can be constructed on a specific tile
  /// @param prototype The type of building
  /// @param coord The coordinate to check
  /// @return True if the building's required terrain matches the terrain of the given coord
  function canBuildOnTile(bytes32 prototype, PositionData memory coord) internal view returns (bool) {
    EResource resource = EResource(P_RequiredTile.get(prototype));
    return resource == EResource.NULL || uint8(resource) == P_Terrain.get(coord.x, coord.y);
  }
}
