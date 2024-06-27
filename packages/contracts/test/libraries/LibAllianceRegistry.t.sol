// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { Keys_AllianceRegistry } from "codegen/index.sol";
import { LibAllianceRegistry } from "libraries/LibAllianceRegistry.sol";

import { IAllianceSystem } from "codegen/world/IAllianceSystem.sol";
import { EAllianceInviteMode, EAllianceRole } from "src/Types.sol";

contract LibAllianceRegistryTest is PrimodiumTest {
  bytes32 avalonEntity;
  bytes32 bruiserEntity;
  bytes32 edenEntity;

  function setUp() public override {
    super.setUp();
    avalonEntity = keccak256(abi.encodePacked("Avalon"));
    bruiserEntity = keccak256(abi.encodePacked("Bruiser"));
    edenEntity = keccak256(abi.encodePacked("Eden"));
    vm.startPrank(creator);
  }

  function testGetEmpty() public {
    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities.length, 0);
  }

  function testGetLengthSingle() public {
    LibAllianceRegistry.add(avalonEntity);
    assertEq(LibAllianceRegistry.size(), 1);
  }

  function testGetLengthMultple() public {
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(edenEntity);
    LibAllianceRegistry.add(bruiserEntity);
    assertEq(LibAllianceRegistry.size(), 3);
  }

  function testAddAndGetSingleEntity() public {
    LibAllianceRegistry.add(avalonEntity);
    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities.length, 1);
    assertEq(allianceEntities[0], avalonEntity);
  }

  function testAddAndGetSingleIndex() public {
    LibAllianceRegistry.add(avalonEntity);
    bytes32 allianceEntity = LibAllianceRegistry.getIndex(0);
    assertEq(allianceEntity, avalonEntity);
  }

  function testAddAndGetMultiple() public {
    LibAllianceRegistry.add(edenEntity);
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities.length, 3);
    assertEq(allianceEntities[0], edenEntity);
    assertEq(allianceEntities[1], avalonEntity);
    assertEq(allianceEntities[2], bruiserEntity);
  }

  function testIndexOfEmpty() public {
    int256 index = LibAllianceRegistry.indexOf(avalonEntity);
    assertEq(index, -1);
  }

  function testIndexOfSingle() public {
    LibAllianceRegistry.add(avalonEntity);
    int256 index = LibAllianceRegistry.indexOf(avalonEntity);
    assertEq(index, 0);
  }

  function testIndexOfOneOfMany() public {
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    LibAllianceRegistry.add(edenEntity);
    int256 index = LibAllianceRegistry.indexOf(bruiserEntity);
    assertEq(index, 1);
  }

  function testIndexOfLastOfMany() public {
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    LibAllianceRegistry.add(edenEntity);
    int256 index = LibAllianceRegistry.indexOf(edenEntity);
    assertEq(index, 2);
  }

  function testRemoveEmpty() public {
    LibAllianceRegistry.removeEntity(avalonEntity);
    assertEq(LibAllianceRegistry.size(), 0);
  }

  function testRemoveFromSingle() public {
    LibAllianceRegistry.add(avalonEntity);
    assertEq(LibAllianceRegistry.size(), 1);
    LibAllianceRegistry.removeEntity(avalonEntity);
    assertEq(LibAllianceRegistry.size(), 0);
  }

  function testRemoveFromManyByEntity() public {
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    LibAllianceRegistry.add(edenEntity);
    assertEq(LibAllianceRegistry.size(), 3);
    LibAllianceRegistry.removeEntity(bruiserEntity);
    assertEq(LibAllianceRegistry.size(), 2);
    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities[0], avalonEntity);
    assertEq(allianceEntities[1], edenEntity);
  }

  function testRemoveFromManyByIndex() public {
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    LibAllianceRegistry.add(edenEntity);
    assertEq(LibAllianceRegistry.size(), 3);
    LibAllianceRegistry.removeIndex(1);
    assertEq(LibAllianceRegistry.size(), 2);
    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities[0], avalonEntity);
    assertEq(allianceEntities[1], edenEntity);
  }

  function testClearEmpty() public {
    assertEq(LibAllianceRegistry.size(), 0);
    LibAllianceRegistry.add(avalonEntity);
    LibAllianceRegistry.add(bruiserEntity);
    LibAllianceRegistry.add(edenEntity);
    assertEq(LibAllianceRegistry.size(), 3);
    LibAllianceRegistry.clear();
    assertEq(LibAllianceRegistry.size(), 0);
  }

  function testAddOnCreation() public {
    avalonEntity = world.Pri_11__create("Avalon", EAllianceInviteMode.Open);

    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities.length, 1);
    assertEq(allianceEntities[0], avalonEntity);
  }

  function testFindAfterMultipleSpawn() public {
    vm.stopPrank();
    vm.startPrank(alice);
    avalonEntity = world.Pri_11__create("Avalon", EAllianceInviteMode.Open);
    vm.stopPrank();
    vm.startPrank(bob);
    bruiserEntity = world.Pri_11__create("Bruiser", EAllianceInviteMode.Open);
    vm.stopPrank();
    vm.startPrank(eve);
    edenEntity = world.Pri_11__create("Eden", EAllianceInviteMode.Open);

    bytes32[] memory allianceEntities = LibAllianceRegistry.getAll();
    assertEq(allianceEntities.length, 3);
    assertEq(allianceEntities[0], avalonEntity);
    assertEq(allianceEntities[1], bruiserEntity);
    assertEq(allianceEntities[2], edenEntity);
  }
}
