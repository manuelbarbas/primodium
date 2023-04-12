// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";
import { Perlin } from "./Perlin.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

library LibPerlin {
  // Terrain precision = 12, Resource precision = 8
  function getSingleDepth(Coord memory coord, int256 perlinSeed, int256 denom) internal pure returns (int128) {
    int128 depth = Perlin.noise(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom, 64);
    return depth;
  }

  // multiply depth and convert to readable number
  function mulDepthBy10000(int128 depth) internal pure returns (int256) {
    return Math.muli(depth, 10000);
  }

  function getTerrainDepth(Coord memory coord) internal pure returns (int128) {
    int128 terrainKey = getSingleDepth(coord, 0, 8);
    return terrainKey;
  }
}
