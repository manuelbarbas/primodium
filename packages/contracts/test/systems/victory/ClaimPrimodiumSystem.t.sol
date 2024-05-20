// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";
import { EPointType } from "src/Types.sol";
import { P_GameConfig, PositionData, Asteroid, AsteroidData, P_ConquestConfig, Points, LastConquered, Home } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

contract ClaimPrimodiumSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
  }

  function testConquerAsteroid() public {
    console.logBytes32(Home.get(playerEntity));
    PositionData memory position = findSecondaryAsteroid(Home.get(playerEntity));
    vm.startPrank(creator);

    bytes32 asteroidEntity = LibAsteroid.createSecondaryAsteroid(position);
    AsteroidData memory asteroidData = Asteroid.get(asteroidEntity);

    conquerAsteroid(creator, Home.get(playerEntity), asteroidEntity);
    uint256 holdTime = (P_ConquestConfig.getHoldTime() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    uint256 conquerTime = block.timestamp + holdTime;
    vm.warp(conquerTime);

    vm.startPrank(creator);

    world.Pri_11__claimPrimodium(asteroidEntity);
    assertEq(Points.get(playerEntity, uint8(EPointType.Shard)), asteroidData.primodium);
    assertEq(LastConquered.get(asteroidEntity), block.timestamp);
  }

  function testConquerAsteroidFailNotOwner() public {
    PositionData memory position = findSecondaryAsteroid(Home.get(playerEntity));
    vm.startPrank(creator);

    bytes32 asteroidEntity = LibAsteroid.createSecondaryAsteroid(position);

    conquerAsteroid(creator, Home.get(playerEntity), asteroidEntity);
    uint256 conquerTime = block.timestamp + P_ConquestConfig.getHoldTime();
    vm.warp(conquerTime);

    vm.startPrank(alice);

    vm.expectRevert("[Claim Primodium] Only owner can claim Primodium");
    world.Pri_11__claimPrimodium(asteroidEntity);
  }

  function testConquerAsteroidFailNoPoints() public {
    PositionData memory position = findSecondaryAsteroid(Home.get(playerEntity));
    vm.startPrank(creator);

    bytes32 asteroidEntity = LibAsteroid.createSecondaryAsteroid(position);

    conquerAsteroid(creator, Home.get(playerEntity), asteroidEntity);
    uint256 holdTime = (P_ConquestConfig.getHoldTime() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();

    vm.startPrank(creator);
    Asteroid.setPrimodium(asteroidEntity, 0);

    vm.expectRevert("[Claim Primodium] This asteroid does not generate Primodium");
    world.Pri_11__claimPrimodium(asteroidEntity);
  }

  function testConquerAsteroidFailNotLongEnough() public {
    bytes32 asteroidEntity = spawn(alice);
    PositionData memory position = findSecondaryAsteroid(asteroidEntity);
    vm.startPrank(creator);

    bytes32 secondaryAsteroidEntity = LibAsteroid.createSecondaryAsteroid(position);

    conquerAsteroid(alice, asteroidEntity, secondaryAsteroidEntity);
    uint256 holdTime = (P_ConquestConfig.getHoldTime() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    uint256 conquerTime = LastConquered.get(secondaryAsteroidEntity) + holdTime;
    vm.warp(conquerTime - 1);

    vm.startPrank(alice);
    vm.expectRevert("[Claim Primodium] Asteroid hasn't been held long enough to claim Primodium");
    world.Pri_11__claimPrimodium(secondaryAsteroidEntity);
  }
}
