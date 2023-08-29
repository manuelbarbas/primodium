// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { P_TerrainComponent, ID as P_TerrainComponentID } from "components/P_TerrainComponent.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Coord } from "src/types.sol";
import "src/prototypes.sol";

library LibInitTerrain {
  function init(IWorld world) internal {
    P_TerrainComponent terrainComponent = P_TerrainComponent(world.getComponent(P_TerrainComponentID));
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(0, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(1, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(2, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(3, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(5, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(6, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(7, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(8, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(9, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(10, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(13, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(14, 8, 0)), LithiumID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(20, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(21, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(25, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(26, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(27, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(28, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(29, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(30, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(31, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(32, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(33, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(34, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(35, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(36, 8, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(20, 9, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(21, 9, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(28, 9, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(32, 9, 0)), IronID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(0, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(1, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(2, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(3, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(5, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(6, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(8, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(9, 15, 0)), SulfurID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(20, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(21, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(25, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(26, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(27, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(28, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(29, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(30, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(31, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(32, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(33, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(34, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(35, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(36, 15, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(20, 16, 0)), CopperID);
    terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(28, 16, 0)), CopperID);
  }
}
