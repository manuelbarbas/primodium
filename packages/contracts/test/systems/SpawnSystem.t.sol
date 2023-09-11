// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract SpawnSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testSpawnu() public {
    bytes32 playerEntity = LibEncode.addressToEntity(alice);
    bytes32 asteroidEntity = LibEncode.getHash(worldAddress, playerEntity);
    spawn(alice);

    bool spawned = Player.getSpawned(world, playerEntity);
    assertTrue(spawned, "Player should have spawned");
    assertEq(
      Player.getHomeAsteroid(world, playerEntity),
      asteroidEntity,
      "Player should have spawned on their own asteroid"
    );
    assertEq(
      RockType.get(world, asteroidEntity),
      uint8(ERock.Asteroid),
      "Asteroid should be a normal asteroid"
    );

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
      address newAddress = address(
        uint160(uint256(keccak256(abi.encodePacked(i * 12345))))
      );
      bytes32 playerEntity = LibEncode.addressToEntity(newAddress);
      PositionData memory position = LibAsteroid.getUniqueAsteroidPosition(i);
      spawn(newAddress);
      bytes32 asteroid = Player.getHomeAsteroid(world, playerEntity);
      PositionData memory retrievedPosition = Position.get(world, asteroid);
      assertEq(position, retrievedPosition);
    }
  }
}
