// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract SpawnSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testSpawnu() public {
    bytes32 playerEntity = addressToEntity(creator);
    bytes32 asteroidEntity = LibEncode.getHash(playerEntity);
    spawn(creator);
    vm.startPrank(creator);

    bool spawned = Spawned.get(playerEntity);
    assertTrue(spawned, "Player should have spawned");
    assertEq(Home.getAsteroid(playerEntity), asteroidEntity, "Player should have spawned on their own asteroid");
    assertEq(RockType.get(asteroidEntity), uint8(ERock.Asteroid), "Asteroid should be a normal asteroid");

    assertEq(Level.get(playerEntity), 1, "Player should have level 1");
  }

  function testSpawnTwice() public {
    world.spawn();
    vm.expectRevert(bytes("[SpawnSystem] Already spawned"));
    world.spawn();
  }

  function testUniqueAsteroidPosition() public {
    // Asteroid Count is incremented before creation in createAsteroid(), so the asteroid index starts at one.
    // We create ten asteroids consecutively and check if their assigned coordinates match the expected coordinates based on their order of creation.
    for (uint256 i = 1; i <= 10; i++) {
      address newAddress = address(uint160(uint256(keccak256(abi.encodePacked(i * 12345)))));
      bytes32 playerEntity = addressToEntity(newAddress);
      PositionData memory position = LibAsteroid.getUniqueAsteroidPosition(i);
      spawn(newAddress);
      bytes32 asteroid = Home.getAsteroid(playerEntity);
      PositionData memory retrievedPosition = Position.get(asteroid);
      assertEq(position, retrievedPosition);
    }
  }

  function testBuildMainBase() public {
    bytes32 asteroid = spawn(creator);
    vm.startPrank(creator);
    // P_AsteroidData memory maxRange = P_Asteroid.get();
    // PositionData memory calculatedPosition = PositionData(maxRange.xBounds / 2, maxRange.yBounds / 2, asteroid);
    // logPosition(calculatedPosition);

    PositionData memory coord = Position.get(MainBasePrototypeId);
    coord.parent = asteroid;
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    PositionData memory position = Position.get(buildingEntity);
    assertEq(position.x, coord.x, "x values differ");
    assertEq(position.y, coord.y, "y values differ");

    assertTrue(OwnedBy.get(buildingEntity) != 0);
    assertEq(OwnedBy.get(buildingEntity), addressToEntity(creator));
  }

  function testBuildBeforeSpawnFail() public {
    PositionData memory nonIronPositionData = getNonIronPosition(creator);

    vm.expectRevert(bytes("[BuildSystem] Player has not spawned"));
    world.build(EBuilding.IronMine, nonIronPositionData);
  }
}
