// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";

import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../prototypes/Tiles.sol";
import { Perlin } from "noise/Perlin.sol";

library LibTerrain {
  function getTerrainFromId(
    int32 id
  ) public pure returns (uint256) {
    if (id == 0) return WaterID;
    if (id == 1) return LithiumID;
    if (id == 2) return RegolithID;
    if (id == 3) return SandstoneID;
    if (id == 4) return AlluviumID;
    if (id == 5) return LithiumMinerID;
    return WaterID;
  }

  function getIdFromTerrain(
    uint256 id
  ) public pure returns (int32) {
    if (id == WaterID) return 0;
    if (id == LithiumID) return 1;
    if (id == RegolithID) return 2;
    if (id == SandstoneID) return 3;
    if (id == AlluviumID) return 4;
    if (id == LithiumMinerID) return 5;
    return 0;
  }

  // Terrain precision = 12, Resource precision = 8
  function getSingleDepth(Coord memory coord, int256 perlinSeed, uint8 precision) public pure returns (int128) {
    int128 depth = Perlin.noise2d(coord.x + perlinSeed, coord.y + perlinSeed, 0, precision);
    return depth;
  }

  // TODO: randomize perlinSeed
  function getPerlinSeed1() public pure returns (int256) {
    return 60194;
  }

  function getPerlinSeed2() public pure returns (int256) {
    return 74037;
  }

  function getPerlinSeed3() public pure returns (int256) {
    return 53092;
  }

  function getPerlinSeed4() public pure returns (int256) {
    return 17326;
  }

  function getTerrainNormalizedDepth(Coord memory coord) public pure returns (int128) {
    int128 depth1 = getSingleDepth(coord, getPerlinSeed1(), 12);
    int128 depth2 = getSingleDepth(coord, getPerlinSeed2(), 12);
    int128 depth3 = getSingleDepth(coord, getPerlinSeed3(), 12);
    int128 depth4 = getSingleDepth(coord, getPerlinSeed4(), 12);
    int128 normalizedDepth = ((depth1 + depth2 + depth3 + depth4) / 5) * 100;
    return normalizedDepth;
  }

  function getTerrainKey(Coord memory coord) public pure returns (uint256) {
    int128 normalizedDepth = getTerrainNormalizedDepth(coord);
    if (normalizedDepth < 29) return WaterID;
    if (normalizedDepth < 32) return BiofilmID;
    if (normalizedDepth < 35) return AlluviumID;
    if (normalizedDepth < 39) return SandstoneID;
    if (normalizedDepth < 48) return RegolithID;
    if (normalizedDepth < 51) return BedrockID;
    return BedrockID;
  }

  function getResourceNormalizedDepth(Coord memory coord) public pure returns (int128) {
    int128 depth1 = getSingleDepth(coord, getPerlinSeed1(), 8);
    int128 depth2 = getSingleDepth(coord, getPerlinSeed2(), 8);
    int128 normalizedDepth = ((depth1 + depth2) / 4) * 100;
    return normalizedDepth;
  }

  function getResourceKey(Coord memory coord) public pure returns (uint256) {
    int128 normalizedDepth = getResourceNormalizedDepth(coord);
    //base starting materials (most common)
    if (normalizedDepth > 18 && normalizedDepth < 19) return CopperID;
    if (normalizedDepth > 20 && normalizedDepth < 21) return LithiumID;
    if (normalizedDepth > 24 && normalizedDepth < 25) return IronID;

    //mid game items
    if (normalizedDepth < 14) return TitaniumID;
    if (normalizedDepth > 26 && normalizedDepth < 27) return IridiumID;
    if (normalizedDepth > 30 && normalizedDepth < 31) return OsmiumID;
    if (normalizedDepth > 34 && normalizedDepth < 34) return TungstenID;

    //late game (rarer) items
    if (normalizedDepth > 27 && normalizedDepth < 26) return KimberliteID;
    if (normalizedDepth > 32 && normalizedDepth < 32) return UraniniteID;
    if (normalizedDepth > 36 && normalizedDepth < 37) return BolutiteID;

    return AirID;
  }

  function getTopLayerKey(Coord memory coord) public pure returns (uint256) {
    uint256 terrainKey = getTerrainKey(coord);
    uint256 resourceKey = getResourceKey(coord);(coord);

    if (resourceKey == AirID || terrainKey == WaterID) {
      return terrainKey;
    } else {
      return resourceKey;
    }
  }
}