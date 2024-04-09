// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";
import { IsFleet, Home, FleetMovement, P_UnitPrototypes, P_EnumToPrototype, P_Transportables, P_GameConfig, ReversePosition, Score, OwnedBy, ResourceCount, ConquestAsteroid, Position, P_ConquestConfig, P_ConquestConfigData, PositionData, LastConquered, AsteroidCount } from "codegen/index.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

import { EResource, EScoreType, EUnit } from "src/Types.sol";
import { UnitKey, FleetOwnedByKey, FleetIncomingKey, FleetOutgoingKey } from "src/Keys.sol";

import { FleetSet } from "libraries/fleet/FleetSet.sol";
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

    PositionData memory expectedPosition = LibMath.getPositionByVector(
      expectedDistance,
      LibMath.getRandomDirection(uint256(expectedAsteroidEntity))
    );
    console.logBytes32(ReversePosition.get(expectedPosition.x, expectedPosition.y));
    console.log("quadrant a", LibConquestAsteroid.getQuadrant(expectedPosition));

    spawn(alice);

    console.log("quadrant b", LibConquestAsteroid.getQuadrant(Position.get(expectedAsteroidEntity)));
    assertTrue(ConquestAsteroid.get(expectedAsteroidEntity).isConquestAsteroid, "Conquest asteroid not created");
    assertGt(expectedDistance, 0, "Conquest asteroid distance 0");
    assertEq(
      ConquestAsteroid.getDistanceFromCenter(expectedAsteroidEntity),
      expectedDistance,
      "Conquest asteroid distance incorrect"
    );
    assertEq(LastConquered.get(expectedAsteroidEntity), block.timestamp, "Last conquered time incorrect");

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
    uint256 spawnSlot = 69;
    for (uint256 i = 0; i < 360; i++) {
      if (i == spawnSlot) {
        continue;
      }
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

    // assertEq(LibMath.getPositionByVector(distance, spawnSlot), Position.get(asteroidEntity));
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

  function testShardAsteroidGameOver() public {
    uint256 deaths = 4;
    vm.prank(creator);
    P_GameConfig.setUnitDeathLimit(deaths);
    bytes32 fleetEntity = spawnFleetWithUnit(Home.get(addressToEntity(creator)), EUnit.MinutemanMarine, deaths);

    vm.prank(creator);
    world.Primodium__abandonFleet(fleetEntity);

    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    bytes32 homeAsteroidEntity = spawn(alice);

    conquerAsteroid(alice, homeAsteroidEntity, asteroidEntity);

    uint256 oneTenthOfLifespan = config.conquestAsteroidLifeSpan / 10;
    vm.warp(block.timestamp + oneTenthOfLifespan);

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    assertEq(Score.get(addressToEntity(alice), uint8(EScoreType.Conquest)), 0);
  }

  function testConquestAsteroidPastLifeSpanScore() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    bytes32 homeAsteroidEntity = spawn(alice);

    conquerAsteroid(alice, homeAsteroidEntity, asteroidEntity);

    vm.warp(block.timestamp + config.conquestAsteroidLifeSpan + 1_000_000);

    // should only count time up to the end of the lifespan
    uint256 timeNotMissed = ConquestAsteroid.getSpawnTime(asteroidEntity) +
      config.conquestAsteroidLifeSpan -
      LastConquered.get(asteroidEntity);
    uint256 timeNotMissedPct = (timeNotMissed * 1_000) / config.conquestAsteroidLifeSpan;

    // add points for explosion
    uint256 points = P_ConquestConfig.getConquestAsteroidPoints() +
      (timeNotMissedPct * config.conquestAsteroidPoints) /
      1_000;

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    assertEq(Score.get(addressToEntity(alice), uint8(EScoreType.Conquest)), points);
  }

  // nothing should happen if the asteroid is not owned
  function testConquestAsteroidNoExplodeNoOwner() public {
    spawnPlayers(config.conquestAsteroidSpawnOffset - 2);

    bytes32 asteroidEntity = LibEncode.getTimedHash(bytes32("conquestAsteroid"), bytes32(AsteroidCount.get() + 1));

    spawn(alice);

    vm.warp(ConquestAsteroid.getSpawnTime(asteroidEntity) + config.conquestAsteroidLifeSpan);

    PositionData memory position = Position.get(asteroidEntity);
    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);
    assertEq(position, Position.get(asteroidEntity));
  }

  function checkRespawn(bytes32 asteroidEntity, PositionData memory prevPosition) internal {
    assertEq(OwnedBy.get(asteroidEntity), bytes32(""), "Asteroid still owned");
    assertEq(LastConquered.get(asteroidEntity), block.timestamp, "Last conquered time not reset");
    assertEq(ConquestAsteroid.getSpawnTime(asteroidEntity), block.timestamp, "Spawn time not reset");
    assertXYNotEq(Position.get(asteroidEntity), prevPosition);
    assertNotEq(
      LibConquestAsteroid.getQuadrant(prevPosition),
      LibConquestAsteroid.getQuadrant(Position.get(asteroidEntity))
    );
  }

  function testConquestAsteroidExplodeRespawn() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    uint256 lifespan = (P_ConquestConfig.getConquestAsteroidLifeSpan() * WORLD_SPEED_SCALE) /
      P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ConquestAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    vm.warp(explodeTime);

    PositionData memory position = Position.get(asteroidEntity);
    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);
    checkRespawn(asteroidEntity, position);
  }

  function testConquestAsteroidExplodeKillIncomingFleet() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    uint256 lifespan = (P_ConquestConfig.getConquestAsteroidLifeSpan() * WORLD_SPEED_SCALE) /
      P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ConquestAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    vm.warp(explodeTime);

    // create and send fleet to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);

    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    setupCreateFleet(creator, Home.get(playerEntity), unitCounts, resourceCounts);

    vm.startPrank(creator);
    bytes32 fleetEntity = world.Primodium__createFleet(Home.get(playerEntity), unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, asteroidEntity);
    vm.stopPrank();

    assertGt(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "Fleet not incoming");
    bytes32[] memory incomingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetIncomingKey);

    assertGe(incomingFleetEntities.length, 1, "Fleet length not 1 or more");

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    incomingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetIncomingKey);

    assertEq(incomingFleetEntities.length, 0, "Fleet length not 0");

    assertFalse(FleetSet.has(Home.get(playerEntity), FleetOwnedByKey, fleetEntity), "home asteroid still owns fleet");

    assertFalse(IsFleet.get(fleetEntity), "fleet still exists");
    assertEq(OwnedBy.get(fleetEntity), 0, "fleet still owned");
  }

  function testConquestAsteroidExplodeKillOrbitingFleet() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    uint256 lifespan = (P_ConquestConfig.getConquestAsteroidLifeSpan() * WORLD_SPEED_SCALE) /
      P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ConquestAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    vm.warp(explodeTime);

    // create and send fleet to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);

    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    setupCreateFleet(creator, Home.get(playerEntity), unitCounts, resourceCounts);

    vm.startPrank(creator);
    bytes32 fleetEntity = world.Primodium__createFleet(Home.get(playerEntity), unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, asteroidEntity);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    assertLt(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "Fleet not orbiting");
    bytes32[] memory incomingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetIncomingKey);

    assertGe(incomingFleetEntities.length, 1, "Fleet length not 1 or more");

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    incomingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetIncomingKey);

    assertEq(incomingFleetEntities.length, 0, "Fleet length not 0");

    assertFalse(FleetSet.has(Home.get(playerEntity), FleetOwnedByKey, fleetEntity), "home asteroid still owns fleet");

    assertFalse(IsFleet.get(fleetEntity), "fleet still exists");
    assertEq(OwnedBy.get(fleetEntity), 0, "fleet still owned");
  }

  function testConquestAsteroidExplodeKillOutgoingFleet() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    uint256 lifespan = (P_ConquestConfig.getConquestAsteroidLifeSpan() * WORLD_SPEED_SCALE) /
      P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ConquestAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    vm.warp(explodeTime);

    // create and send fleet to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);

    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    setupCreateFleet(creator, Home.get(playerEntity), unitCounts, resourceCounts);

    vm.startPrank(creator);
    bytes32 fleetEntity = world.Primodium__createFleet(Home.get(playerEntity), unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, asteroidEntity);

    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    world.Primodium__sendFleet(fleetEntity, Home.get(playerEntity));
    vm.stopPrank();
    assertGt(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "Fleet not outgoing");

    bytes32[] memory outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);

    assertGe(outgoingFleetEntities.length, 1, "Fleet length not 1 or more");

    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);

    assertEq(outgoingFleetEntities.length, 0, "Fleet length not 0");

    assertFalse(FleetSet.has(Home.get(playerEntity), FleetOwnedByKey, fleetEntity), "home asteroid still owns fleet");

    assertFalse(IsFleet.get(fleetEntity), "fleet still exists");
    assertEq(OwnedBy.get(fleetEntity), 0, "fleet still owned");
  }

  function testConquestAsteroidExplodeDontKillArrivedOutgoingFleet() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    uint256 lifespan = (P_ConquestConfig.getConquestAsteroidLifeSpan() * WORLD_SPEED_SCALE) /
      P_GameConfig.getWorldSpeed();

    uint256 explodeTime = ConquestAsteroid.getSpawnTime(asteroidEntity) + lifespan;

    vm.warp(explodeTime);

    // create and send fleet to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);

    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    setupCreateFleet(creator, Home.get(playerEntity), unitCounts, resourceCounts);

    vm.startPrank(creator);
    bytes32 fleetEntity = world.Primodium__createFleet(Home.get(playerEntity), unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, asteroidEntity);

    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    world.Primodium__sendFleet(fleetEntity, Home.get(playerEntity));
    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    vm.stopPrank();

    bytes32[] memory outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);

    assertGe(outgoingFleetEntities.length, 1, "Fleet length not 1 or more");

    assertEq(OwnedBy.get(fleetEntity), Home.get(playerEntity), "fleet not owned 1");
    world.Primodium__claimConquestAsteroidPoints(asteroidEntity);

    outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);

    assertEq(outgoingFleetEntities.length, 0, "Fleet length not 0");

    assertTrue(FleetSet.has(Home.get(playerEntity), FleetOwnedByKey, fleetEntity), "home asteroid doesn't own fleet");

    assertTrue(IsFleet.get(fleetEntity), "fleet doesn't exist");
    assertEq(OwnedBy.get(fleetEntity), Home.get(playerEntity), "fleet not owned");
  }

  function testConquestAsteroidFleetNotOutgoingOnNextMove() public {
    bytes32 asteroidEntity = testConquestAsteroidConquer();

    // create and send fleet to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);

    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    setupCreateFleet(creator, Home.get(playerEntity), unitCounts, resourceCounts);

    vm.startPrank(creator);
    bytes32 fleetEntity = world.Primodium__createFleet(Home.get(playerEntity), unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, asteroidEntity);

    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    world.Primodium__sendFleet(fleetEntity, Home.get(playerEntity));
    vm.warp(FleetMovement.getArrivalTime(fleetEntity) + 1);
    vm.stopPrank();

    bytes32 bobAsteroidEntity = spawn(bob);

    vm.startPrank(creator);
    world.Primodium__sendFleet(fleetEntity, bobAsteroidEntity);

    bytes32[] memory outgoingFleetEntities = FleetSet.getFleetEntities(asteroidEntity, FleetOutgoingKey);

    assertEq(outgoingFleetEntities.length, 0, "Fleet length not 0");

    assertTrue(FleetSet.has(Home.get(playerEntity), FleetOwnedByKey, fleetEntity), "home asteroid doesn't own fleet");
  }
}
