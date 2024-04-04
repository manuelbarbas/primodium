// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";
import { ReversePosition, Score, OwnedBy, ResourceCount, ConquestAsteroid, Position, P_ConquestConfig, P_ConquestConfigData, PositionData, LastConquered, AsteroidCount } from "codegen/index.sol";

import { EResource, EScoreType } from "src/Types.sol";

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
    assertEq(
      ResourceCount.get(expectedAsteroidEntity, uint8(EResource.R_Encryption)),
      config.conquestAsteroidEncryption,
      "Conquest asteroid encryption incorrect"
    );
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

  function testConquestAsteroidConquer() public returns (bytes32) {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    bytes32 homeAsteroidEntity = spawn(alice);

    conquerAsteroid(alice, homeAsteroidEntity, asteroidEntity);

    assertEq(OwnedBy.get(asteroidEntity), addressToEntity(alice), "Asteroid not conquered");
    return asteroidEntity;
  }

  function testConquestAsteroidEncryptionRegen() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();
    uint256 encryption = ResourceCount.get(asteroidEntity, uint8(EResource.R_Encryption));
    vm.warp(block.timestamp + 1000);

    world.Primodium__claimResources(asteroidEntity);
    uint256 regen = config.conquestAsteroidEncryptionRegen;
    if (regen > 0) {
      assertGt(
        ResourceCount.get(asteroidEntity, uint8(EResource.R_Encryption)),
        encryption,
        "Encryption not regenerating"
      );
    } else {
      assertEq(ResourceCount.get(asteroidEntity, uint8(EResource.R_Encryption)), encryption, "Encryption regenerating");
    }
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

  function testConquestAsteroidClaimDrip() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    bytes32 homeAsteroidEntity = spawn(alice);

    conquerAsteroid(alice, homeAsteroidEntity, asteroidEntity);

    uint256 oneTenthOfLifespan = config.conquestAsteroidLifeSpan / 10;
    console.log("oneTenthOfLifespan", oneTenthOfLifespan);
    vm.warp(block.timestamp + oneTenthOfLifespan);

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    uint256 oneTenthOfPoints = config.conquestAsteroidPoints / 10;
    assertEq(Score.get(addressToEntity(alice), uint8(EScoreType.Conquest)), oneTenthOfPoints);
  }

  function testConquestAsteroidPastLifeSpan() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    bytes32 homeAsteroidEntity = spawn(alice);

    conquerAsteroid(alice, homeAsteroidEntity, asteroidEntity);

    vm.warp(block.timestamp + config.conquestAsteroidLifeSpan + 1_000_000);

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    // should only count time up to the end of the lifespan
    uint256 timeNotMissed = ConquestAsteroid.getSpawnTime(asteroidEntity) +
      config.conquestAsteroidLifeSpan -
      LastConquered.get(asteroidEntity);
    uint256 timeNotMissedPct = (timeNotMissed * 1_000) / config.conquestAsteroidLifeSpan;
    uint256 points = (timeNotMissedPct * config.conquestAsteroidPoints) / 1_000;

    assertEq(Score.get(addressToEntity(alice), uint8(EScoreType.Conquest)), points);
  }
}
