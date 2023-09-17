// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";
import { EResource } from "src/Types.sol";
import { LibStorage } from "codegen/Libraries.sol";

contract TestLibStorage is PrimodiumTest {
  bytes32 mockPlayerEntity = "mockPlayerEntity";
  EResource mockResource = EResource.Iron; // Assume EResource.Iron is 1

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
  }

  function testDecreaseStoredResourceEnoughResources() public {
    ResourceCount.set(mockPlayerEntity, mockResource, 100);
    LibStorage.decreaseStoredResource(mockPlayerEntity, mockResource, 50);
    assertEq(ResourceCount.get(mockPlayerEntity, mockResource), 50);
  }

  function testDecreaseStoredResourceNotEnoughResources() public {
    LibStorage.decreaseStoredResource(mockPlayerEntity, mockResource, 50);
    assertEq(ResourceCount.get(mockPlayerEntity, mockResource), 0);
  }

  function testIncreaseStoredResourceBelowMaxCap() public {
    MaxResourceCount.set(mockPlayerEntity, mockResource, 100);
    LibStorage.increaseStoredResource(mockPlayerEntity, mockResource, 50);
    assertEq(ResourceCount.get(mockPlayerEntity, mockResource), 50);
  }

  function testIncreaseStoredResourceAtMaxCap() public {
    MaxResourceCount.set(mockPlayerEntity, mockResource, 100);
    ResourceCount.set(mockPlayerEntity, mockResource, 100);
    LibStorage.increaseStoredResource(mockPlayerEntity, mockResource, 50);
    assertEq(ResourceCount.get(mockPlayerEntity, mockResource), 100);
  }

  function testIncreaseMaxUtility() public {
    LibStorage.increaseMaxUtility(mockPlayerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(mockPlayerEntity, mockResource), 20);
  }

  function testDecreaseMaxUtilityEnoughUtility() public {
    MaxResourceCount.set(mockPlayerEntity, mockResource, 50);
    LibStorage.decreaseMaxUtility(mockPlayerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(mockPlayerEntity, mockResource), 30);
  }

  function testDecreaseMaxUtilityNotEnoughUtility() public {
    LibStorage.decreaseMaxUtility(mockPlayerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(mockPlayerEntity, mockResource), 0);
  }
}
