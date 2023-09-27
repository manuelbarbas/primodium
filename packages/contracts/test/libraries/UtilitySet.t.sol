// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract UtilitySetTest is PrimodiumTest {
  bytes32 player1 = "player1";
  EResource resource1 = EResource.U_Electricity;
  EResource resource2 = EResource.U_Housing;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
  }

  function testHas() public {
    UtilitySet.set(player1, resource1, 50);
    assertTrue(UtilitySet.has(player1, resource1));
    assertFalse(UtilitySet.has(player1, resource2));
  }

  function testGet() public {
    UtilitySet.set(player1, resource1, 50);
    assertEq(UtilitySet.get(player1, resource1), 50);
  }

  function testGetAll() public {
    UtilitySet.set(player1, resource1, 50);
    UtilitySet.set(player1, resource2, 20);
    uint8[] memory allResources = UtilitySet.getAll(player1);
    assertEq(allResources.length, 2);
  }

  function testSet() public {
    UtilitySet.set(player1, resource1, 50);
    assertEq(UtilitySet.get(player1, resource1), 50);
  }

  function testRemove() public {
    UtilitySet.set(player1, resource1, 50);
    UtilitySet.remove(player1, resource1);
    assertFalse(UtilitySet.has(player1, resource1));
  }

  function testClear() public {
    UtilitySet.set(player1, resource1, 50);
    UtilitySet.set(player1, resource2, 20);
    UtilitySet.clear(player1);
    uint8[] memory allResources = UtilitySet.getAll(player1);
    assertEq(allResources.length, 0);
  }
}
