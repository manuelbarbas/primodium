// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "test/PrimodiumTest.t.sol";

contract UtilityMapTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  uint8 resource1 = uint8(EResource.U_Electricity);
  uint8 resource2 = uint8(EResource.U_Housing);

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
  }

  function testHas() public {
    UtilityMap.set(playerEntity, resource1, 50);
    assertTrue(UtilityMap.has(playerEntity, resource1));
    assertFalse(UtilityMap.has(playerEntity, resource2));
  }

  function testGet() public {
    UtilityMap.set(playerEntity, resource1, 50);
    assertEq(UtilityMap.get(playerEntity, resource1), 50);
  }

  function testGetAll() public {
    UtilityMap.set(playerEntity, resource1, 50);
    UtilityMap.set(playerEntity, resource2, 20);
    uint8[] memory allResources = UtilityMap.keys(playerEntity);
    assertEq(allResources.length, 2);
  }

  function testSet() public {
    UtilityMap.set(playerEntity, resource1, 50);
    assertEq(UtilityMap.get(playerEntity, resource1), 50);
  }

  function testRemove() public {
    UtilityMap.set(playerEntity, resource1, 50);
    UtilityMap.remove(playerEntity, resource1);
    assertFalse(UtilityMap.has(playerEntity, resource1));
  }

  function testClear() public {
    UtilityMap.set(playerEntity, resource1, 50);
    UtilityMap.set(playerEntity, resource2, 20);
    UtilityMap.clear(playerEntity);
    uint8[] memory allResources = UtilityMap.keys(playerEntity);
    assertEq(allResources.length, 0);
  }
}
