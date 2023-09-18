// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract SpawnSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testSpawnu() public {
    bytes32 playerEntity = addressToEntity(alice);
    bytes32 asteroidEntity = LibEncode.getHash(worldAddress, playerEntity);
    spawn(alice);

    bool spawned = Spawned.get(world, playerEntity);
    assertTrue(spawned, "Player should have spawned");
    assertEq(HomeAsteroid.get(world, playerEntity), asteroidEntity, "Player should have spawned on their own asteroid");
    assertEq(RockType.get(world, asteroidEntity), ERock.Asteroid, "Asteroid should be a normal asteroid");

    assertEq(Level.get(world, playerEntity), 1, "Player should have level 1");
  }

  function testSpawnTwice() public prank(alice) {
    world.spawn();
    vm.expectRevert(bytes("[SpawnSystem] Player already spawned"));
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
      bytes32 asteroid = HomeAsteroid.get(world, playerEntity);
      PositionData memory retrievedPosition = Position.get(world, asteroid);
      assertEq(position, retrievedPosition);
    }
  }

  function testBuildMainBase() public {
    bytes32 asteroid = spawn(alice);
    P_AsteroidData memory maxRange = P_Asteroid.get();
    PositionData memory calculatedPosition = PositionData(maxRange.xBounds / 2, maxRange.yBounds / 2, asteroid);
    logPosition(calculatedPosition);
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, calculatedPosition);

    PositionData memory position = Position.get(world, buildingEntity);
    PositionData memory coord = Position.get(world, MainBasePrototypeId);
    assertEq(position.x, coord.x, "x values differ");
    assertEq(position.y, coord.y, "y values differ");

    assertTrue(OwnedBy.get(world, buildingEntity) != 0);
    assertEq(OwnedBy.get(world, buildingEntity), addressToEntity(alice));
  }

  function testBuildBeforeSpawnFail() public {
    vm.startPrank(alice);

    PositionData memory nonIronPositionData = getNonIronPosition(alice);

    vm.expectRevert(bytes("[BuildSystem] Player has not spawned"));
    world.build(EBuilding.IronMine, nonIronPositionData);

    vm.stopPrank();
  }
}
