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
    terrainComponent.set(LibEncode.encodeCoord(Coord(0, 0, 0)), uint256(1));
  }
}
