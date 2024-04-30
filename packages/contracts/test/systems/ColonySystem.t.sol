// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { AsteroidSet } from "libraries/AsteroidSet.sol";

import { Home, Asteroid, GracePeriod } from "codegen/index.sol";

contract ColonySystemTest is PrimodiumTest {
  // If you're looking for ColonySlot tests, go to LibColony.t.sol

  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  bytes32 creatorHomeAsteroid;
  bytes32 creatorEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);

    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);

    creatorEntity = addressToEntity(creator);
    creatorHomeAsteroid = spawn(creator);

    vm.prank(creator);
    GracePeriod.set(creatorHomeAsteroid, block.timestamp - 1);
    conquerAsteroid(alice, aliceHomeAsteroid, creatorHomeAsteroid);

    vm.prank(creator);
    GracePeriod.set(aliceHomeAsteroid, block.timestamp - 1);
  }

  function testChangeHome() public {
    assertEq(Home.get(aliceEntity), aliceHomeAsteroid, "Alice's home asteroid should be set to her primary home");
    vm.startPrank(alice);
    world.Primodium__changeHome(creatorHomeAsteroid);

    assertEq(Home.get(aliceEntity), creatorHomeAsteroid, "Alice's home asteroid should be set to the new home");
  }

  function testChangeHomeNotAsteroid() public {
    vm.startPrank(alice);
    vm.expectRevert("[Colony] Entity is not an asteroid");
    world.Primodium__changeHome(creatorEntity);
  }

  function testChangeHomeNotOwned() public {
    vm.startPrank(alice);
    vm.expectRevert("[Colony] Asteroid not owned by player");
    world.Primodium__changeHome(bobHomeAsteroid);
  }

  function testLostHomeWhenConqueredAndNoOwnedAsteroids() public {
    testChangeHome();
    assertEq(Home.get(creatorEntity), bytes32(0), "Creator should have no home asteroid as they own no more asteroids");
  }

  function testForcedChangeHomeWhenHomeConquered() public {
    conquerAsteroid(bob, bobHomeAsteroid, aliceHomeAsteroid);

    assertEq(
      Home.get(aliceEntity),
      creatorHomeAsteroid,
      "Alice's home asteroid should have been changed to another asteroid she owns"
    );
  }
}
