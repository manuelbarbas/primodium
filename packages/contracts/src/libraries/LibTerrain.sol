// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { Coord } from "../types.sol";

import { WaterID, LithiumID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID } from "../prototypes/Block.sol";

library LibTerrain {
  function getTerrainFromId(
    int32 id
  ) internal pure returns (uint256) {
    if (id == 0) return WaterID;
    if (id == 1) return LithiumID;
    if (id == 2) return RegolithID;
    if (id == 3) return RegolithID;
    if (id == 4) return AlluviumID;
    if (id == 5) return LithiumMinerID;
    return WaterID;
  }

  function getTerrainTile(Coord memory coord) public pure returns (uint256) {
    if (coord.x == 0 && coord.y == 0) return LithiumID;
    return WaterID;
  }
}