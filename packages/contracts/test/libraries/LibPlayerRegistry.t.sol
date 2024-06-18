// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { Keys_PlayerRegistry } from "codegen/index.sol";
import { LibPlayerRegistry } from "libraries/LibPlayerRegistry.sol";

import { ISpawnSystem } from "codegen/world/ISpawnSystem.sol";

contract LibPlayerRegistryTest is PrimodiumTest {
  bytes32 aliceEntity;
  bytes32 bobEntity;
  bytes32 eveEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    bobEntity = addressToEntity(bob);
    eveEntity = addressToEntity(eve);
    vm.startPrank(creator);
  }

  function testGetEmpty() public {
    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities.length, 0);
  }

  function testGetLengthSingle() public {
    LibPlayerRegistry.add(aliceEntity);
    assertEq(LibPlayerRegistry.size(), 1);
  }

  function testGetLengthMultple() public {
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(eveEntity);
    LibPlayerRegistry.add(bobEntity);
    assertEq(LibPlayerRegistry.size(), 3);
  }

  function testAddAndGetSingleEntity() public {
    LibPlayerRegistry.add(aliceEntity);
    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities.length, 1);
    assertEq(playerEntities[0], aliceEntity);
  }

  function testAddAndGetSingleIndex() public {
    LibPlayerRegistry.add(aliceEntity);
    bytes32 playerEntity = LibPlayerRegistry.getIndex(0);
    assertEq(playerEntity, aliceEntity);
  }

  function testAddAndGetMultiple() public {
    LibPlayerRegistry.add(eveEntity);
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities.length, 3);
    assertEq(playerEntities[0], eveEntity);
    assertEq(playerEntities[1], aliceEntity);
    assertEq(playerEntities[2], bobEntity);
  }

  function testIndexOfEmpty() public {
    int256 index = LibPlayerRegistry.indexOf(aliceEntity);
    assertEq(index, -1);
  }

  function testIndexOfSingle() public {
    LibPlayerRegistry.add(aliceEntity);
    int256 index = LibPlayerRegistry.indexOf(aliceEntity);
    assertEq(index, 0);
  }

  function testIndexOfOneOfMany() public {
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    LibPlayerRegistry.add(eveEntity);
    int256 index = LibPlayerRegistry.indexOf(bobEntity);
    assertEq(index, 1);
  }

  function testIndexOfLastOfMany() public {
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    LibPlayerRegistry.add(eveEntity);
    int256 index = LibPlayerRegistry.indexOf(eveEntity);
    assertEq(index, 2);
  }

  function testRemoveEmpty() public {
    LibPlayerRegistry.removeEntity(aliceEntity);
    assertEq(LibPlayerRegistry.size(), 0);
  }

  function testRemoveFromSingle() public {
    LibPlayerRegistry.add(aliceEntity);
    assertEq(LibPlayerRegistry.size(), 1);
    LibPlayerRegistry.removeEntity(aliceEntity);
    assertEq(LibPlayerRegistry.size(), 0);
  }

  function testRemoveFromManyByEntity() public {
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    LibPlayerRegistry.add(eveEntity);
    assertEq(LibPlayerRegistry.size(), 3);
    LibPlayerRegistry.removeEntity(bobEntity);
    assertEq(LibPlayerRegistry.size(), 2);
    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities[0], aliceEntity);
    assertEq(playerEntities[1], eveEntity);
  }

  function testRemoveFromManyByIndex() public {
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    LibPlayerRegistry.add(eveEntity);
    assertEq(LibPlayerRegistry.size(), 3);
    LibPlayerRegistry.removeIndex(1);
    assertEq(LibPlayerRegistry.size(), 2);
    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities[0], aliceEntity);
    assertEq(playerEntities[1], eveEntity);
  }

  function testClearEmpty() public {
    assertEq(LibPlayerRegistry.size(), 0);
    LibPlayerRegistry.add(aliceEntity);
    LibPlayerRegistry.add(bobEntity);
    LibPlayerRegistry.add(eveEntity);
    assertEq(LibPlayerRegistry.size(), 3);
    LibPlayerRegistry.clear();
    assertEq(LibPlayerRegistry.size(), 0);
  }

  function testAddOnSpawn() public {
    vm.stopPrank();
    vm.startPrank(alice);
    world.Pri_11__spawn();

    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities.length, 1);
    assertEq(playerEntities[0], aliceEntity);
  }

  function testFindAfterMultipleSpawn() public {
    vm.stopPrank();
    vm.startPrank(alice);
    world.Pri_11__spawn();
    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__spawn();
    vm.stopPrank();
    vm.startPrank(eve);
    world.Pri_11__spawn();

    bytes32[] memory playerEntities = LibPlayerRegistry.getAll();
    assertEq(playerEntities.length, 3);
    assertEq(playerEntities[0], aliceEntity);
    assertEq(playerEntities[1], bobEntity);
    assertEq(playerEntities[2], eveEntity);
  }
}
