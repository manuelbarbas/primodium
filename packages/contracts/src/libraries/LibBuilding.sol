// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// tables
import { Home, P_RequiredTile, P_RequiredBaseLevel, P_Asteroid, P_Terrain, P_EnumToPrototype, P_AsteroidData, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/Tables.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibDependency } from "libraries/LibDependency.sol";
import { LibProduction } from "libraries/LibProduction.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource } from "src/Types.sol";

library LibBuilding {
  function build(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    PositionData memory coord
  ) internal returns (bytes32 buildingEntity) {
    buildingEntity = LibEncode.getHash(BuildingKey, coord);
    uint32 level = 1;

    Spawned.set(buildingEntity, true);
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
    Position.set(buildingEntity, coord);
    LastClaimedAt.set(buildingEntity, block.number);

    placeBuildingTiles(playerEntity, buildingEntity, buildingPrototype, coord);
    LibDependency.increaseDependencyUsage(playerEntity, buildingPrototype, level);
    LibProduction.initResourceProduction(playerEntity, buildingEntity);
    OwnedBy.set(buildingEntity, playerEntity);
  }

  function placeBuildingTiles(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    bytes32 buildingPrototype,
    PositionData memory position
  ) public {
    int32[] memory blueprint = P_Blueprint.get(buildingPrototype);
    Bounds memory bounds = getPlayerBounds(playerEntity);

    bytes32[] memory tiles = new bytes32[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
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

  function getPlayerBounds(bytes32 playerEntity) internal view returns (Bounds memory bounds) {
    uint32 playerLevel = Level.get(playerEntity);
    P_AsteroidData memory asteroidDims = P_Asteroid.get();
    DimensionsData memory range = Dimensions.get(ExpansionKey, playerLevel);

    return
      Bounds({
        maxX: (asteroidDims.xBounds + range.x) / 2 - 1,
        maxY: (asteroidDims.yBounds + range.y) / 2 - 1,
        minX: (asteroidDims.xBounds - range.x) / 2,
        minY: (asteroidDims.yBounds - range.y) / 2
      });
  }

  function getBuildingFromCoord(PositionData memory coord) internal view returns (bytes32) {
    bytes32 buildingTile = LibEncode.getHash(BuildingTileKey, coord);
    return OwnedBy.get(buildingTile);
  }

  function getBaseLevel(bytes32 playerEntity) internal view returns (uint32) {
    if (!Spawned.get(playerEntity)) return 0;
    bytes32 mainBase = Home.getMainBase(playerEntity);
    return Level.get(mainBase);
  }

  function hasRequiredBaseLevel(
    bytes32 playerEntity,
    bytes32 prototype,
    uint32 level
  ) internal view returns (bool) {
    uint32 mainLevel = getBaseLevel(playerEntity);
    return mainLevel >= P_RequiredBaseLevel.get(prototype, level);
  }

  function hasRequiredBaseLevel(
    bytes32 playerEntity,
    EBuilding building,
    uint32 level
  ) internal view returns (bool) {
    return hasRequiredBaseLevel(playerEntity, P_EnumToPrototype.get(BuildingKey, uint8(building)), level);
  }

  function canBuildOnTile(bytes32 prototype, PositionData memory coord) internal view returns (bool) {
    EResource resource = P_RequiredTile.get(prototype);
    return resource == EResource.NULL || resource == P_Terrain.get(coord.x, coord.y);
  }

  function canBuildOnTile(EBuilding building, PositionData memory coord) internal view returns (bool) {
    EResource resource = P_RequiredTile.get(P_EnumToPrototype.get(BuildingKey, uint8(building)));
    return resource == EResource.NULL || resource == P_Terrain.get(coord.x, coord.y);
  }
}
