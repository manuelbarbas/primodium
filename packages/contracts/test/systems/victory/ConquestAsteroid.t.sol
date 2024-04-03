// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";
import { ReversePosition, ConquestAsteroid, Position, P_ConquestConfig, P_ConquestConfigData, PositionData, LastConquered, AsteroidCount } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibConquestAsteroid } from "libraries/LibConquestAsteroid.sol";

contract ConquestSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  P_ConquestConfigData config;
  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
    config = P_ConquestConfig.get();
  }

  function testConquestAsteroidSpawn() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 expectedAsteroidEntity = LibEncode.getTimedHash(
      bytes32("conquestAsteroid"),
      bytes32(config.conquestAsteroidSpawnOffset)
    );

    uint256 expectedDistance = LibMath.getSpawnDistance(config.conquestAsteroidSpawnOffset);
    spawn(alice);

    assertTrue(ConquestAsteroid.get(expectedAsteroidEntity).isConquestAsteroid, "Conquest asteroid not created");
    assertGt(expectedDistance, 0, "Conquest asteroid distance 0");
    assertEq(
      ConquestAsteroid.getDistanceFromCenter(expectedAsteroidEntity),
      expectedDistance,
      "Conquest asteroid distance incorrect"
    );
    assertEq(LastConquered.get(expectedAsteroidEntity), block.timestamp, "Last conquered time incorrect");

    PositionData memory expectedPosition = LibMath.getPositionByVector(
      expectedDistance,
      LibMath.getRandomDirection(uint256(expectedAsteroidEntity))
    );
    assertEq(Position.get(expectedAsteroidEntity), expectedPosition);
  }

  function testConquestAsteroidSpawnDistanceIncrease() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity1 = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    spawn(alice);

    vm.warp(block.timestamp + 1 days);

    spawnPlayers(config.conquestAsteroidSpawnFrequency - 1);

    bytes32 asteroidEntity2 = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    spawn(bob);

    PositionData memory position1 = Position.get(asteroidEntity1);
    PositionData memory position2 = Position.get(asteroidEntity2);
    PositionData memory center = PositionData(0, 0, bytes32(""));
    assertGt(LibMath.distance(position2, center), LibMath.distance(position1, center), "Distance not increased");
  }

  function testConquestAsteroidSpawnCollision() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);
    uint256 distance = LibMath.getSpawnDistance(config.conquestAsteroidSpawnOffset);
    vm.startPrank(creator);
    for (uint256 i = 0; i < 359; i++) {
      bytes32 dummyEntity = keccak256(abi.encode(i));
      PositionData memory position = LibMath.getPositionByVector(distance, i);
      ReversePosition.set(position.x, position.y, dummyEntity);
      Position.set(dummyEntity, position);
    }

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));
    // LibConquestAsteroid.spawnConquestAsteroid(asteroidEntity);
    vm.stopPrank();
    spawn(alice);
    assertEq(ConquestAsteroid.getDistanceFromCenter(asteroidEntity), distance);

    assertEq(LibMath.getPositionByVector(distance, 359), Position.get(asteroidEntity));
  }
}
