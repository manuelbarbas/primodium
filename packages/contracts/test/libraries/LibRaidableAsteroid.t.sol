// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { P_AsteroidProbabilityConfig, P_AsteroidProbabilityConfigData, PositionData, P_GameConfigData, P_GameConfig, OwnedBy, ReversePosition, UnitCount, P_Unit, Asteroid, ResourceCount, MaxResourceCount, FleetMovement, DroidRegenTimestamp } from "codegen/index.sol";

import { EResource, EUnit } from "src/Types.sol";
import { MainBasePrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";

contract LibRaidableAsteroidTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 asteroidEntity;
  bytes32 raidableAsteroid;
  bytes32 fleetEntity;
  uint256 maxDroidCount;
  uint256 initialDroidTrainingTime;
  uint256 droidTrainingTime;
  PositionData raidablePosition;
  P_GameConfigData gameConfig;

  function setUp() public override {
    super.setUp();

    gameConfig = P_GameConfig.get();
    gameConfig.asteroidDistance = 8;
    gameConfig.maxAsteroidsPerPlayer = 12;
    gameConfig.asteroidChanceInv = 2;
    asteroidEntity = spawn(creator);
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    P_GameConfig.set(gameConfig);
    vm.stopPrank();
    initialDroidTrainingTime = P_Unit.getTrainingTime(DroidPrototypeId, 0);
  }

  // todo: migrate this test to Asteroid test suite
  function testAsteroidProbabilityConfig() public {
    P_AsteroidProbabilityConfigData memory asteroidProb = P_AsteroidProbabilityConfig.get();
    assertEq(
      asteroidProb.common1 +
        asteroidProb.common2 +
        asteroidProb.eliteMicro +
        asteroidProb.eliteSmall +
        asteroidProb.eliteMedium +
        asteroidProb.eliteLarge,
      100,
      "Secondary asteroid probabilities do not add up to 100"
    );
  }

  function testInitRaidableAsteroidCommon1() public {
    raidablePosition = findRaidableAsteroid(asteroidEntity, false);
    initRaidableAsteroid();
  }

  function testInitRaidableAsteroidCommon2() public {
    raidablePosition = findRaidableAsteroid(asteroidEntity, true);
    initRaidableAsteroid();
  }

  function initRaidableAsteroid() internal {
    vm.startPrank(creator);
    // spawn fleet and travel to location
    fleetEntity = spawnFleetWithUnit(asteroidEntity, EUnit.MinutemanMarine, 10000);
    vm.startPrank(creator);
    P_Unit.setTrainingTime(DroidPrototypeId, 0, initialDroidTrainingTime);
    droidTrainingTime = P_Unit.getTrainingTime(DroidPrototypeId, 0);

    world.Primodium__sendFleet(fleetEntity, raidablePosition); // this should init raidable asteroid
    raidableAsteroid = ReversePosition.get(raidablePosition.x, raidablePosition.y);
    assertTrue(raidableAsteroid != bytes32(0), "Raidable asteroid not initialized");
    console.log("asteroid max level before reset: ", Asteroid.getMaxLevel(raidableAsteroid));

    P_GameConfig.set(gameConfig);

    assertEq(OwnedBy.get(raidableAsteroid), bytes32(0), "initialized raidable asteroid should be owned by 0x0");
    assertTrue(
      Asteroid.getIsAsteroid(raidableAsteroid),
      "initialized raidable asteroid should be considered an asteroid"
    );

    // check that upon raidable asteroid init, it has max droids, and resources are filled
    (maxDroidCount, ) = LibAsteroid.getSecondaryAsteroidUnitsAndEncryption(Asteroid.getMaxLevel(raidableAsteroid));
    assertEq(
      UnitCount.get(raidableAsteroid, DroidPrototypeId),
      maxDroidCount,
      "initialized raidable asteroid should be filled with droids"
    );

    uint256 resourceMax = MaxResourceCount.get(raidableAsteroid, uint8(EResource.Lithium));
    uint256 resourceOwned = ResourceCount.get(raidableAsteroid, uint8(EResource.Lithium));
    assertTrue(resourceMax > 0, "Lithium resources on initialized raidable asteroid should be filled");
    assertTrue(resourceOwned == resourceMax, "Common resources on initialized raidable asteroid should be filled");

    if (Asteroid.getMaxLevel(raidableAsteroid) >= 3) {
      resourceMax = MaxResourceCount.get(raidableAsteroid, uint8(EResource.PVCell));
      resourceOwned = ResourceCount.get(raidableAsteroid, uint8(EResource.PVCell));
      assertTrue(resourceOwned == resourceMax, "Advanced resources on initialized raidable asteroid should be filled");
    }

    // fast forward to arrival
    switchPrank(creator);
    FleetMovement.setArrivalTime(fleetEntity, block.timestamp);
    vm.warp(block.timestamp + 1);
  }

  function testRegenAfterRaid() public {
    testInitRaidableAsteroidCommon2();
    world.Primodium__attack(fleetEntity, raidableAsteroid);

    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), 0, "Not all droids destroyed");
    assertEq(ResourceCount.get(raidableAsteroid, uint8(EResource.Lithium)), 0, "Resources not looted");

    vm.warp(block.timestamp + droidTrainingTime);
    world.Primodium__claimUnits(raidableAsteroid);
    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), 1, "Droids should start regenerating after raid");

    world.Primodium__claimResources(raidableAsteroid);
    assertGt(
      ResourceCount.get(raidableAsteroid, uint8(EResource.Lithium)),
      0,
      "Resources should regenerate after raid"
    );

    vm.warp(block.timestamp + droidTrainingTime * maxDroidCount * 2);
    world.Primodium__claimUnits(raidableAsteroid);
    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), maxDroidCount, "Droid regen should not exceed maximum");
  }

  function testNoDroidRegenWhenOwned() public {
    testInitRaidableAsteroidCommon2();
    conquerAsteroid(creator, asteroidEntity, raidableAsteroid);
    assertEq(OwnedBy.get(raidableAsteroid), playerEntity, "Asteroid was not conquered");
    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), 0, "Not all droids destroyed");

    vm.warp(block.timestamp + droidTrainingTime * maxDroidCount + 1);

    world.Primodium__claimUnits(raidableAsteroid);
    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), 0, "Droids should not regen when owned by player");
  }

  function testDroid0BuildTime() public {
    testInitRaidableAsteroidCommon2();
    P_Unit.setTrainingTime(DroidPrototypeId, 0, 0);
    world.Primodium__attack(fleetEntity, raidableAsteroid);

    assertEq(UnitCount.get(raidableAsteroid, DroidPrototypeId), 0, "Not all droids destroyed");
    assertEq(ResourceCount.get(raidableAsteroid, uint8(EResource.Lithium)), 0, "Resources not looted");

    vm.warp(block.timestamp + 1);
    world.Primodium__claimUnits(raidableAsteroid);
    assertEq(
      UnitCount.get(raidableAsteroid, DroidPrototypeId),
      maxDroidCount,
      "Droids are not regenerating when 0 build time"
    );
  }
}
