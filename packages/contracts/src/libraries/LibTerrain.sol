// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";

import { WaterID, LithiumID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID } from "../prototypes/Block.sol";
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

  function getTerrainTile(Coord memory coord) public pure returns (uint256) {
    if (coord.x == 0 && coord.y == 0) return LithiumID;
      // TODO: randomize perlinSeed
      int128 perlinSeed = 413;
      int128 denom = 128;
      int128 depth = Perlin.noise2d(coord.x + perlinSeed, coord.y + perlinSeed, denom, 64);

      if (depth < 32) return AlluviumID;
      if (depth < 16) return RegolithID;
      if (depth < 8) return SandstoneID;
      if (depth < 4) return LithiumID;
      return WaterID;
  }
}