// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { SpawnSystem, ID as SpawnSystemID } from "systems/SpawnSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { EAsteroidType } from "../../types.sol";
import { Bounds } from "../../types.sol";

import { EAsteroidType } from "../../types.sol";

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

  function testSpawnu() public prank(alice) {
    uint256 playerEntity = addressToEntity(alice);
    uint256 asteroidEntity = LibEncode.hashEntity(world, playerEntity);
    spawnSystem.executeTyped();
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
    assertEq(
      LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(playerEntity),
      1,
      "Player should have level 1"
    );
    Bounds memory bounds = LibBuilding.getPlayerBounds(world, playerEntity);
    console.log(uint32(bounds.minX));
    console.log(uint32(bounds.maxX));
    console.log(uint32(bounds.minY));
    console.log(uint32(bounds.maxY));
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

  function testBuildMainBase() public {
    uint256 buildingEntity = spawn(alice);

    Coord memory position = PositionComponent(component(PositionComponentID)).getValue(buildingEntity);
    Coord memory coord = PositionComponent(component(PositionComponentID)).getValue(MainBaseID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    assertTrue(ownedByComponent.has(buildingEntity));
    assertEq(ownedByComponent.getValue(buildingEntity), addressToEntity(alice));

    vm.stopPrank();
  }
}
