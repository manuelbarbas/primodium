// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../prototypes/Tiles.sol";

import { Perlin } from "./Perlin.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

int128 constant _4 = 4 * 2 ** 64;
int128 constant _5 = 5 * 2 ** 64;

library LibTerrain {
  // Terrain precision = 12, Resource precision = 8
  function getSingleDepth(Coord memory coord, int256 perlinSeed, int256 denom) public pure returns (int128) {
    int128 depth = Perlin.noise(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom, 64);
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

  function avgTerrainNormalizedDepth(
    int128 depth1,
    int128 depth2,
    int128 depth3,
    int128 depth4
  ) public pure returns (int256) {
    int128 terrainDepthSum = Math.add(Math.add(Math.add(depth1, depth2), depth3), depth4);
    return Math.muli(Math.div(terrainDepthSum, _5), 100);
  }

  function getTerrainNormalizedDepth(Coord memory coord) public pure returns (int256) {
    int128 depth1 = getSingleDepth(coord, getPerlinSeed1(), 12);
    int128 depth2 = getSingleDepth(coord, getPerlinSeed2(), 12);
    int128 depth3 = getSingleDepth(coord, getPerlinSeed3(), 12);
    int128 depth4 = getSingleDepth(coord, getPerlinSeed4(), 12);
    return avgTerrainNormalizedDepth(depth1, depth2, depth3, depth4);
  }

  function getTerrainKey(Coord memory coord) public pure returns (uint256) {
    int256 normalizedDepth = getTerrainNormalizedDepth(coord);
    if (normalizedDepth <= 29) return WaterID;
    if (normalizedDepth <= 32) return BiofilmID;
    if (normalizedDepth <= 35) return AlluviumID;
    if (normalizedDepth <= 39) return SandstoneID;
    if (normalizedDepth <= 48) return RegolithID;
    if (normalizedDepth <= 51) return BedrockID;
    return BedrockID;
  }

  function avgResourceNormalizedDepth(int128 depth1, int128 depth2) public pure returns (int256) {
    int128 resourceDepthSum = Math.add(depth1, depth2);
    return Math.muli(Math.div(resourceDepthSum, _4), 10000);
  }

  function getResourceNormalizedDepth(Coord memory coord) public pure returns (int256) {
    int128 depth1 = getSingleDepth(coord, getPerlinSeed1(), 8);
    int128 depth2 = getSingleDepth(coord, getPerlinSeed2(), 8);
    return avgResourceNormalizedDepth(depth1, depth2);
  }

  function getResourceKey(Coord memory coord) public pure returns (uint256) {
    int256 normalizedDepth = getResourceNormalizedDepth(coord);
    //base starting materials (most common)
    if (normalizedDepth >= 1800 && normalizedDepth <= 1820) return CopperID;
    if (normalizedDepth >= 2000 && normalizedDepth <= 2006) return LithiumID;
    if (normalizedDepth >= 2400 && normalizedDepth <= 2418) return IronID;

    //mid game items
    if (normalizedDepth <= 1350) return TitaniumID;
    if (normalizedDepth >= 2600 && normalizedDepth <= 2602) return IridiumID;
    if (normalizedDepth >= 3095 && normalizedDepth <= 3100) return OsmiumID;
    if (normalizedDepth >= 3400 && normalizedDepth <= 3430) return TungstenID;

    //late game (rarer) items
    if (normalizedDepth >= 2720 && normalizedDepth <= 2721) return KimberliteID;
    if (normalizedDepth >= 3220 && normalizedDepth <= 3222) return UraniniteID;
    if (normalizedDepth >= 3620 && normalizedDepth <= 3622) return BolutiteID;

    return AirID;
  }

  function getTopLayerKey(Coord memory coord) internal pure returns (uint256) {
    // return 0;
    // temp: doesn't call perlin mud library until compilation error is fixed
    // see https://github.com/latticexyz/mud/issues/439
    uint256 terrainKey = getTerrainKey(coord);
    uint256 resourceKey = getResourceKey(coord);

    if (resourceKey == AirID || terrainKey == WaterID) {
      return terrainKey;
    } else {
      return resourceKey;
    }
  }
}
