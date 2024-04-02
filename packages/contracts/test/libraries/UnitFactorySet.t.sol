// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";

contract UnitFactorySetTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingEntity = "buildingEntity";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
  }

  function testAdd() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    assertTrue(UnitFactorySet.has(playerEntity, buildingEntity));
    assertFalse(UnitFactorySet.has(playerEntity, bytes32("other")));
  }

  function testAddDuplicate() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.add(playerEntity, buildingEntity);
    assertTrue(UnitFactorySet.has(playerEntity, buildingEntity));
    assertFalse(UnitFactorySet.has(playerEntity, bytes32("other")));
  }

  function testGetAll() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.add(playerEntity, bytes32("other"));
    bytes32[] memory all = UnitFactorySet.getAll(playerEntity);
    assertEq(all.length, 2);
    assertEq(all[0], buildingEntity);
    assertEq(all[1], bytes32("other"));
  }

  function testGetAllEmpty() public {
    bytes32[] memory all = UnitFactorySet.getAll(playerEntity);
    assertEq(all.length, 0);
  }

  function testRemove() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.remove(playerEntity, buildingEntity);
    assertFalse(UnitFactorySet.has(playerEntity, buildingEntity));
  }

  function testRemovePlayerDoesntExist() public {
    UnitFactorySet.remove(playerEntity, buildingEntity);
    assertFalse(UnitFactorySet.has(playerEntity, buildingEntity));
  }

  function testRemoveBuildingDoesntExist() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.remove(playerEntity, bytes32("other"));
    assertTrue(UnitFactorySet.has(playerEntity, buildingEntity));
  }

  function testRemoveOnlyOneBuilding() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.remove(playerEntity, buildingEntity);
    assertFalse(UnitFactorySet.has(playerEntity, buildingEntity));
  }

  function testClear() public {
    UnitFactorySet.add(playerEntity, buildingEntity);
    UnitFactorySet.add(playerEntity, bytes32("other"));
    UnitFactorySet.clear(playerEntity);
    assertFalse(UnitFactorySet.has(playerEntity, buildingEntity));
    assertFalse(UnitFactorySet.has(playerEntity, bytes32("other")));
  }
}
