// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "../PrimodiumTest.t.sol";

contract LibAsteroidTest is PrimodiumTest {
  bytes32 player;
  bytes32 asteroid;

  function setUp() public override {
    super.setUp();

    P_GameConfigData memory gameConfig = P_GameConfig.get();
    gameConfig.asteroidDistance = 8;
    gameConfig.maxAsteroidsPerPlayer = 12;
    gameConfig.asteroidChanceInv = 2;
    asteroid = spawn(creator);
    vm.startPrank(creator);
    player = addressToEntity(creator);
    P_GameConfig.set(gameConfig);
    vm.stopPrank();
  }

  function testIsAsteroid() public {
    uint256 chanceInv = P_GameConfig.get().asteroidChanceInv;
    bytes32 entity = 0 << 128;
    assertFalse(LibAsteroid.isAsteroid(entity, chanceInv));
    entity = bytes32(uint256(1 << 128));
    assertTrue(LibAsteroid.isAsteroid(entity, chanceInv));
    entity = bytes32(uint256(2 << 128));
    assertFalse(LibAsteroid.isAsteroid(entity, chanceInv));
  }

  function testFuzzAsteroidData(bytes32 entity) public {
    AsteroidData memory asteroidData = LibAsteroid.getAsteroidData(entity, false);
    assertTrue(asteroidData.isAsteroid);
    assertFalse(asteroidData.spawnsSecondary);
    assertLe(asteroidData.mapId, 5, "map id too high");
    assertGe(asteroidData.mapId, 2, "map id too low");
    assertGe(asteroidData.maxLevel, 1, "max level too high");
    assertLe(asteroidData.maxLevel, 4, "max level too low");
  }

  function findSecondaryAsteroid() public returns (PositionData memory) {
    P_GameConfigData memory config = P_GameConfig.get();
    PositionData memory sourcePosition = getHomeAsteroidPosition(creator);
    logPosition(sourcePosition);
    bytes32 asteroidSeed;
    PositionData memory targetPosition;
    uint256 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      PositionData memory targetPositionRelative = LibAsteroid.getPosition(
        i,
        config.asteroidDistance,
        config.maxAsteroidsPerPlayer
      );
      logPosition(sourcePosition);
      targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      logPosition(targetPosition);

      asteroidSeed = keccak256(abi.encode(asteroid, bytes32("asteroid"), targetPosition.x, targetPosition.y));
      found = LibAsteroid.isAsteroid(asteroidSeed, config.asteroidChanceInv);
      i++;
    }
    require(found, "uh oh, no asteroid found");
    return (targetPosition);
  }

  function testCreateSecondaryAsteroid() public {
    vm.startPrank(creator);
    PositionData memory position = findSecondaryAsteroid();

    bytes32 actualAsteroidEntity = LibAsteroid.createSecondaryAsteroid(player, position);
    bytes32 asteroidEntity = keccak256(abi.encode(asteroid, bytes32("asteroid"), position.x, position.y));

    assertEq(actualAsteroidEntity, asteroidEntity, "asteroidEntity");
    AsteroidData memory expectedAsteroidData = LibAsteroid.getAsteroidData(asteroidEntity, false);
    AsteroidData memory actualAsteroidData = Asteroid.get(asteroidEntity);

    assertEq(expectedAsteroidData.isAsteroid, actualAsteroidData.isAsteroid, "isAsteroid");
    assertEq(expectedAsteroidData.spawnsSecondary, actualAsteroidData.spawnsSecondary, "spawnsSecondary");
    assertEq(expectedAsteroidData.mapId, actualAsteroidData.mapId, "mapId");
    assertEq(Position.get(asteroidEntity), position);
    assertEq(ReversePosition.get(position.x, position.y), asteroidEntity, "reversePosition");
  }

  function testFailNoAsteroidNoSource() public {
    LibAsteroid.createSecondaryAsteroid(player, PositionData(0, 0, 0));
  }
}
