// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { AsteroidOwnedByKey } from "src/Keys.sol";

import { LibColony } from "libraries/LibColony.sol";
import { AsteroidSet } from "libraries/AsteroidSet.sol";

import { OwnedBy, Asteroid, GracePeriod } from "src/codegen/index.sol";

contract AbandonAsteroidSystemTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  bytes32 eveHomeAsteroid;
  bytes32 eveEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);
    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);
    eveEntity = addressToEntity(eve);
    eveHomeAsteroid = spawn(eve);
  }

  function testAbandonAsteroidInvalidInput() public {
    vm.startPrank(eve);
    vm.expectRevert("[Primodium] Not asteroid owner");
    world.Pri_11__abandonAsteroid(aliceHomeAsteroid);
  }

  function testAbandonAsteroid() public {
    vm.startPrank(creator);
    LibColony.increaseMaxColonySlots(aliceEntity);
    bytes32[] memory prevOwnedAsteroids = AsteroidSet.getAsteroidEntities(aliceEntity, AsteroidOwnedByKey);
    GracePeriod.deleteRecord(eveHomeAsteroid);
    conquerAsteroid(alice, aliceHomeAsteroid, eveHomeAsteroid);
    bytes32[] memory currentOwnedAsteroids = AsteroidSet.getAsteroidEntities(aliceEntity, AsteroidOwnedByKey);

    require(prevOwnedAsteroids.length + 1 == currentOwnedAsteroids.length, "Alice should have gained an asteroid");

    prevOwnedAsteroids = AsteroidSet.getAsteroidEntities(aliceEntity, AsteroidOwnedByKey);
    vm.startPrank(alice);
    world.Pri_11__abandonAsteroid(eveHomeAsteroid);
    vm.stopPrank();
    currentOwnedAsteroids = AsteroidSet.getAsteroidEntities(aliceEntity, AsteroidOwnedByKey);

    require(prevOwnedAsteroids.length - 1 == currentOwnedAsteroids.length, "Alice should have lost an asteroid");
    require(OwnedBy.get(eveHomeAsteroid) == bytes32(0), "Abandoned asteroid should have no owner");

    vm.startPrank(creator);
    LibColony.increaseMaxColonySlots(bobEntity);
    conquerAsteroid(bob, bobHomeAsteroid, eveHomeAsteroid);
    require(OwnedBy.get(eveHomeAsteroid) == bobEntity, "Previously abandoned asteroid should be conquerable by Bob");
  }
}
