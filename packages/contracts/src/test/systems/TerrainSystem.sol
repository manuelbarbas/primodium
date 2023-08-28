// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

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
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(2, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(3, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(6, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(7, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(8, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(10, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(13, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(14, 8, 0)), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 8, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 8, 0)), IronID);
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
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(32, 9, 0)), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(0, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(1, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(2, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(3, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(5, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(6, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(8, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(9, 15, 0)), SulfurID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 15, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(21, 15, 0)), CopperID);
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
    assertEq(LibTerrain.getResourceByCoord(world, Coord(20, 16, 0)), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord(28, 16, 0)), CopperID);
  }
}