// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EBuilding } from "src/Types.sol";

import { Spawned, Home, Level, UsedTiles, MaxResourceCount, Position, PositionData, OwnedBy, P_GameConfig, MaxColonySlots } from "codegen/index.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";

import { UNLIMITED_DELEGATION } from "@latticexyz/world/src/constants.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { SystemCallData } from "@latticexyz/world/src/modules/init/types.sol";
import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/init/implementations/WorldRegistrationSystem.sol";
import { SpawnSystem } from "systems/SpawnSystem.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { UserDelegationControl } from "@latticexyz/world/src/codegen/tables/UserDelegationControl.sol";
import { ISpawnSystem } from "codegen/world/ISpawnSystem.sol";

contract SpawnSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testSpawnu() public {
    bytes32 playerEntity = addressToEntity(creator);
    bytes32 asteroidEntity = spawn(creator);
    vm.startPrank(creator);

    bool spawned = Spawned.get(playerEntity);
    assertTrue(spawned, "Player should have spawned");
    assertEq(Home.get(playerEntity), asteroidEntity, "Player should have spawned on their own asteroid");

    assertEq(Level.get(asteroidEntity), 1, "Asteroid should have level 1");
    assertEq(UsedTiles.length(asteroidEntity), 4, "Asteroid should have 5 * 256 size bitmap");
    assertEq(MaxResourceCount.get(asteroidEntity, uint8(EResource.U_MaxFleets)), 1, "Asteroid should have 1 max fleet");
  }

  function testSpawnAndAuthorizeBatch() public {
    vm.startPrank(alice);
    SystemCallData[] memory systemCalls = new SystemCallData[](2);

    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: ROOT_NAMESPACE,
      name: bytes14("Registration")
    });

    systemCalls[0] = SystemCallData(
      systemId,
      abi.encodeCall(WorldRegistrationSystem.registerDelegation, (bob, UNLIMITED_DELEGATION, new bytes(0)))
    );

    systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: bytes14("Primodium"),
      name: bytes16("SpawnSystem")
    });
    console.logBytes8(ISpawnSystem.Primodium__spawn.selector);
    console.logBytes8(SpawnSystem.spawn.selector);
    systemCalls[1] = SystemCallData(systemId, abi.encodeCall(ISpawnSystem.Primodium__spawn, ()));

    vm.expectRevert();
    world.batchCall(systemCalls);

    systemCalls[1] = SystemCallData(systemId, abi.encodeCall(SpawnSystem.spawn, ()));
    world.batchCall(systemCalls);
    assertTrue(Spawned.get(addressToEntity(alice)), "Alice should have spawned");
    console.log(WorldResourceIdInstance.toString(UserDelegationControl.get(alice, bob)));
  }

  function testSpawnTwice() public {
    world.Primodium__spawn();
    vm.expectRevert(bytes("[SpawnSystem] Already spawned and owns asteroids"));
    world.Primodium__spawn();
  }

  function testRespawn() public {
    vm.startPrank(alice);
    bytes32 aliceEntity = addressToEntity(alice);
    bytes32 spawnAsteroidEntity = world.Primodium__spawn();
    world.Primodium__abandonAsteroid(spawnAsteroidEntity);
    bytes32 respawnAsteroidEntity = world.Primodium__spawn();
    assertTrue(spawnAsteroidEntity != respawnAsteroidEntity, "Respawned asteroid should be different from spawned one");
    assertEq(MaxColonySlots.get(aliceEntity), 1, "Player max colony slots should not increase from respawn");
  }

  function testUniqueAsteroidPosition() public {
    // Asteroid Count is incremented before creation in createAsteroid(), so the asteroid index starts at one.
    // We create ten asteroids consecutively and check if their assigned coordinates match the expected coordinates based on their order of creation.
    for (uint256 i = 1; i <= 10; i++) {
      address newAddress = address(uint160(uint256(keccak256(abi.encodePacked(i * 12345)))));
      bytes32 playerEntity = addressToEntity(newAddress);
      PositionData memory position = LibAsteroid.getUniqueAsteroidPosition(i);
      spawn(newAddress);
      bytes32 asteroidEntity = Home.get(playerEntity);
      PositionData memory retrievedPosition = Position.get(asteroidEntity);
      assertEq(position, retrievedPosition);
    }
  }

  function testBuildMainBase() public {
    bytes32 asteroidEntity = spawn(creator);
    vm.startPrank(creator);

    PositionData memory coord = Position.get(MainBasePrototypeId);
    coord.parentEntity = asteroidEntity;
    bytes32 buildingEntity = Home.get(asteroidEntity);
    PositionData memory position = Position.get(buildingEntity);
    assertEq(position.x, coord.x, "x values differ");
    assertEq(position.y, coord.y, "y values differ");

    assertTrue(OwnedBy.get(buildingEntity) != 0);
    assertEq(OwnedBy.get(buildingEntity), asteroidEntity);
  }

  function testBuildBeforeSpawnFail() public {
    vm.expectRevert(bytes("[BuildSystem] Player has not spawned"));
    world.Primodium__build(EBuilding.IronMine, PositionData(0, 0, 0));
  }
}
