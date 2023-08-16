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

  function testAsteroidLocation() public {
    AsteroidCountComponent asteroidCountComponent = AsteroidCountComponent(
      world.getComponent(AsteroidCountComponentID)
    );
    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));

    for (uint32 i = 0; i < 30; i++) {
      vm.roll(456);
      uint32 count = LibMath.getSafe(asteroidCountComponent, SingletonID);
      Coord memory coord = LibAsteroid.getUniqueAsteroidPosition(addressToEntity(alice), count);
      componentDevSystem.executeTyped(AsteroidCountComponentID, SingletonID, abi.encode(count + 1));
      logCoord(coord);
      vm.roll(block.number + 1);
    }
  }
}
