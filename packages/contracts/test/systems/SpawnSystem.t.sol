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
    for (uint32 i = 1; i <= 10; i++) {
      address newAddress = address(uint160(uint256(keccak256(abi.encodePacked(i * 12345)))));
      bytes32 playerEntity = addressToEntity(newAddress);
      PositionData memory position = LibAsteroid.getUniqueAsteroidPosition(i);
      spawn(newAddress);
      bytes32 asteroid = HomeAsteroid.get(world, playerEntity);
      PositionData memory retrievedPosition = Position.get(world, asteroid);
      assertEq(position, retrievedPosition);
    }
  }
}
