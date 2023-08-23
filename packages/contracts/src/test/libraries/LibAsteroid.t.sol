// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import "../../prototypes.sol";

import { LibAsteroid } from "../../libraries/LibAsteroid.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { Coord, Dimensions } from "../../types.sol";

contract LibAsteroidTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testAsteroidDistance() public view {
    for (uint32 i = 0; i < 10; i++) {
      console.log(LibAsteroid.getDistance(i));
    }
  }

  function testAsteroidLocation() public {
    AsteroidCountComponent asteroidCountComponent = AsteroidCountComponent(
      world.getComponent(AsteroidCountComponentID)
    );
    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));

    for (uint32 i = 0; i < 10; i++) {
      vm.roll(456);
      uint32 count = LibMath.getSafe(asteroidCountComponent, SingletonID);
      Coord memory coord = LibAsteroid.getUniqueAsteroidPosition(world, count);
      componentDevSystem.executeTyped(AsteroidCountComponentID, SingletonID, abi.encode(count + 1));
      logCoord(coord);
      vm.roll(block.number + 1);
    }
  }

  function testFuzzPositionByVector(uint32 distance, uint32 direction) public {
    distance = distance % 100_000;
    direction = direction % 720;
    Coord memory destination = LibAsteroid.getPositionByVector(distance, direction);
    uint32 reverseDirection = direction + 180;
    Coord memory origin = LibAsteroid.getPositionByVector(distance, reverseDirection);
    origin = Coord(origin.x + destination.x, origin.y + destination.y, 0);
    assertCoordEq(origin, Coord(0, 0, 0));
  }

  function testPositionByVector() public {
    uint32 distance = 100;
    uint32 direction = 85;
    Coord memory destination = LibAsteroid.getPositionByVector(distance, direction);
    console.log("params:", distance, direction);
    console.log("destination:", uint32(destination.x), uint32(destination.y));
    uint32 reverseDirection = direction + 180;
    console.log("params:", distance, reverseDirection);
    Coord memory origin = LibAsteroid.getPositionByVector(distance, reverseDirection);
    console.log("origin:", uint32(origin.x), uint32(origin.y));
    origin = Coord(origin.x + destination.x, origin.y + destination.y, 0);
    console.log("origin:", uint32(origin.x), uint32(origin.y));
    assertCoordEq(origin, Coord(0, 0, 0));
  }

  function testPrintPositions() public view {
    uint32 distance = 100;
    uint32 max = 13;
    for (uint32 i = 0; i < max; i++) {
      uint32 direction = (i * 360) / max;
      console.log("direction:", direction);
      Coord memory coord = LibAsteroid.getPositionByVector(distance, (i * 360) / max);
      logCoord(coord);
    }
  }
}
