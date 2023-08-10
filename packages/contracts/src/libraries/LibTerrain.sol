// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// External dependencies
import { IWorld } from "solecs/System.sol";

// Components
import { P_TerrainComponent, ID as P_TerrainComponentID } from "components/P_TerrainComponent.sol";

// Libraries
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

// Types
import { Coord } from "../types.sol";

library LibTerrain {
  /**
   * @dev Retrieve the resource associated with a given coordinate within a world.
   * @param world The world interface where the coordinate is to be searched.
   * @param coord The coordinate structure containing the location in the world.
   * @return uint256 Returns the resource value at the given coordinate.
   * The coordinate's parent field is set to zero before the calculation.
   */
  function getResourceByCoord(IWorld world, Coord memory coord) internal view returns (uint256) {
    coord.parent = 0;
    return LibMath.getSafe(P_TerrainComponent(world.getComponent(P_TerrainComponentID)), LibEncode.encodeCoord(coord));
  }
}
