// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import "../../prototypes.sol";

import { LibAsteroid } from "../../libraries/LibAsteroid.sol";

import { Coord, Dimensions } from "src/types.sol";

contract LibAsteroidTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testAsteroidLocation() public {
    uint256 playerEntity = 164040928692847369239986083538138986999;
    Dimensions memory dimensions = DimensionsComponent(getAddressById(world.components(), DimensionsComponentID))
      .getValue(SingletonID);
    Coord memory coord = LibAsteroid.getUniqueAsteroidPosition(world, playerEntity);
    if (coord.x < 0) {
      console.log("test x: -", uint32(0 - coord.x));
    } else {
      console.log("test x:", uint32(coord.x));
    }
    if (coord.y < 0) {
      console.log("test y: -", uint32(0 - coord.y));
    } else {
      console.log("test y:", uint32(coord.y));
    }
  }

  function testFuzzAsteroidLocation(uint256 playerEntity) public {
    Dimensions memory dimensions = DimensionsComponent(getAddressById(world.components(), DimensionsComponentID))
      .getValue(SingletonID);
    Coord memory coord = LibAsteroid.getUniqueAsteroidPosition(world, playerEntity);
    assertGe(uint32(coord.x), 0);
    assertGe(uint32(coord.y), 0);
    assertLe(uint32(coord.x), uint32(dimensions.x), "x is too big");
    assertLe(uint32(coord.y), uint32(dimensions.y), "y is too big");
  }
}
