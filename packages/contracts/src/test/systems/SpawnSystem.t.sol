// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { SpawnSystem, ID as SpawnSystemID } from "systems/SpawnSystem.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { EAsteroidType } from "../../types.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";

contract SpawnSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  SpawnSystem public spawnSystem;

  PositionComponent public positionComponent;
  AsteroidTypeComponent public asteroidTypeComponent;

  function setUp() public override {
    super.setUp();

    spawnSystem = SpawnSystem(system(SpawnSystemID));
    positionComponent = PositionComponent(component(PositionComponentID));
    asteroidTypeComponent = AsteroidTypeComponent(component(AsteroidTypeComponentID));
  }

  function testSpawn() public prank(alice) {
    uint256 asteroidEntity = abi.decode(spawnSystem.executeTyped(), (uint256));
    uint256 playerEntity = addressToEntity(alice);
    bool spawned = positionComponent.has(playerEntity);
    assertTrue(spawned, "Player should have spawned");
    assertEq(
      positionComponent.getValue(playerEntity).parent,
      asteroidEntity,
      "Player should have spawned on their own asteroid"
    );
    assertEq(
      asteroidTypeComponent.getValue(asteroidEntity),
      uint256(EAsteroidType.NORMAL),
      "Asteroid should be a normal asteroid"
    );
  }

  function testSpawnTwice() public prank(alice) {
    spawnSystem.executeTyped();
    vm.expectRevert(bytes("[SpawnSystem] Player already spawned"));
    spawnSystem.executeTyped();
  }

  function testUniqueAsteroidPosition() public {
    uint256 playerEntity = addressToEntity(alice);
    Coord memory position = LibAsteroid.getUniqueAsteroidPosition(world, playerEntity);
    spawn(alice);
    vm.startPrank(alice);
    uint256 asteroid = positionComponent.getValue(playerEntity).parent;
    Coord memory retrievedPosition = positionComponent.getValue(asteroid);
    assertCoordEq(position, retrievedPosition);
  }
}
