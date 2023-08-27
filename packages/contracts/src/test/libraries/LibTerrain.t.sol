// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { MainBaseID, WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testTerrain() public {
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 7, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 7, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 7, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 7, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(2, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(3, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(4, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(6, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(7, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(8, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(10, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(11, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(13, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(14, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(22, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(23, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(24, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(25, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(26, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(27, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(29, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(30, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(31, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(32, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(33, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(34, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(13, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(14, 9, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(22, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(23, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(24, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(25, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(26, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(27, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(29, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(30, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(31, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(32, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(33, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(34, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(25, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(26, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(27, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(29, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 10, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(4, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(8, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(13, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(14, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(22, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(23, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(25, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(26, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(27, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(29, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(30, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(31, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(32, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(33, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(34, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(4, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(8, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(13, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(14, 16, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(22, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(23, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(26, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(30, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(32, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(34, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 17, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 17, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(35, 17, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(36, 17, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 18, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 18, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 19, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 19, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 20, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 20, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 21, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 21, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 22, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 22, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 23, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 23, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(16, 24, 0)), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(17, 24, 0)), WaterID);
  }
}
