// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { P_AsteroidProbabilityConfig, P_AsteroidProbabilityConfigData, PositionData, P_GameConfigData, P_GameConfig } from "codegen/index.sol";

import { EResource } from "src/Types.sol";
import { MainBasePrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";

contract LibRaidableAsteroidTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 asteroidEntity;

  function setUp() public override {
    super.setUp();

    P_GameConfigData memory gameConfig = P_GameConfig.get();
    gameConfig.asteroidDistance = 8;
    gameConfig.maxAsteroidsPerPlayer = 12;
    gameConfig.asteroidChanceInv = 2;
    asteroidEntity = spawn(creator);
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    P_GameConfig.set(gameConfig);
    vm.stopPrank();
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

  function testBuildRaidableAsteroidCommon1() public {
    PositionData memory raidablePosition = findRaidableAsteroid(asteroidEntity, false);
    vm.startPrank(creator);
    bytes32 raidableAsteroid = LibAsteroid.createSecondaryAsteroid(raidablePosition);
  }

  function testBuildRaidableAsteroidCommon2() public {
    PositionData memory raidablePosition = findRaidableAsteroid(asteroidEntity, true);
    vm.startPrank(creator);
    bytes32 raidableAsteroid = LibAsteroid.createSecondaryAsteroid(raidablePosition);
  }
}
