// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";
import { EResource } from "src/Types.sol";
import { SetPlayerResource } from "codegen/Libraries.sol";

contract SetPlayerResourceTest is PrimodiumTest {
  bytes32 player1 = "player1";
  EResource resource1 = EResource.Iron;
  EResource resource2 = EResource.Copper;

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
  }

  function testHas() public {
    SetPlayerResource.set(player1, resource1, 50);
    assertTrue(SetPlayerResource.has(player1, resource1));
    assertFalse(SetPlayerResource.has(player1, resource2));
  }

  function testGet() public {
    SetPlayerResource.set(player1, resource1, 50);
    assertEq(SetPlayerResource.get(player1, resource1), 50);
  }

  function testGetAll() public {
    SetPlayerResource.set(player1, resource1, 50);
    SetPlayerResource.set(player1, resource2, 20);
    uint8[] memory allResources = SetPlayerResource.getAll(player1);
    assertEq(allResources.length, 2);
  }

  function testGetIndex() public {
    SetPlayerResource.set(player1, resource1, 50);
    assertEq(SetPlayerResource.getIndex(player1, resource1), 0);
  }

  function testSet() public {
    SetPlayerResource.set(player1, resource1, 50);
    assertEq(SetPlayerResource.get(player1, resource1), 50);
  }

  function testRemove() public {
    SetPlayerResource.set(player1, resource1, 50);
    SetPlayerResource.remove(player1, resource1);
    assertFalse(SetPlayerResource.has(player1, resource1));
  }

  function testClear() public {
    SetPlayerResource.set(player1, resource1, 50);
    SetPlayerResource.set(player1, resource2, 20);
    SetPlayerResource.clear(player1);
    uint8[] memory allResources = SetPlayerResource.getAll(player1);
    assertEq(allResources.length, 0);
  }
}
