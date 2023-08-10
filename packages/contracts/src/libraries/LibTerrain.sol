// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../prototypes.sol";

import { Perlin } from "./Perlin.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

int128 constant _4 = 4 * 2 ** 64;
int128 constant _5 = 5 * 2 ** 64;
int256 constant seed1 = 60194;
int256 constant seed2 = 74037;
int256 constant seed3 = 53092;
int256 constant seed4 = 17326;

library LibTerrain {
  // Terrain precision = 12, Resource precision = 8
  function getSingleDepth(Coord memory coord, int256 perlinSeed, int256 denom) internal pure returns (int128) {
    int128 depth = Perlin.noise(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom, 64);
    return depth;
  }

  // multiply depth and convert to readable number
  // todo: move to test
  function mulDepthBy10000(int128 depth) internal pure returns (int256) {
    return Math.muli(depth, 10000);
  }

  function avgResourceNormalizedDepth(int128 depth1, int128 depth2) public pure returns (int256) {
    int128 resourceDepthSum = Math.add(depth1, depth2);
    return Math.muli(Math.div(resourceDepthSum, _4), 10000);
  }

  function getResourceNormalizedDepth(Coord memory coord) public pure returns (int256) {
    int128 depth1 = getSingleDepth(coord, seed1, 8);
    int128 depth2 = getSingleDepth(coord, seed2, 8);
    return avgResourceNormalizedDepth(depth1, depth2);
  }

  function getResourceKey(Coord memory coord) internal pure returns (uint256) {
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
    return getResourceKey(coord);
  }
}
