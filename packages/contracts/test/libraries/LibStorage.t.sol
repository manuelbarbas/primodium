// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract TestLibStorage is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  uint8 mockResource = Iron;
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
  }

  function testIncreaseMaxStorage() public {
    uint8[] memory data = new uint8[](1);
    data[0] = uint8(mockResource);
    P_ListMaxResourceUpgrades.set(buildingPrototype, level, data);
    P_ByLevelMaxResourceUpgrades.set(buildingPrototype, mockResource, level, 100);

    LibStorage.increaseMaxStorage(playerEntity, buildingEntity, level);
    assertEq(MaxResourceCount.get(playerEntity, mockResource), 100);
  }

  function testClearMaxStorageIncrease() public {
    MaxResourceCount.set(playerEntity, mockResource, 100);

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(mockResource);
    P_ListMaxResourceUpgrades.set(buildingPrototype, level, data);
    P_ByLevelMaxResourceUpgrades.set(buildingPrototype, mockResource, level, 50);

    LibStorage.clearMaxStorageIncrease(playerEntity, buildingEntity);
    assertEq(MaxResourceCount.get(playerEntity, mockResource), 50);
  }

  function testFailClearMaxStorageIncreaseTooBig() public {
    MaxResourceCount.set(playerEntity, mockResource, 50);

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(mockResource);
    P_ListMaxResourceUpgrades.set(buildingPrototype, level, data);
    P_ByLevelMaxResourceUpgrades.set(buildingPrototype, mockResource, level, 100);

    LibStorage.clearMaxStorageIncrease(playerEntity, buildingEntity);
  }

  function testDecreaseStoredResourceEnoughResources() public {
    ResourceCount.set(playerEntity, mockResource, 100);
    LibStorage.decreaseStoredResource(playerEntity, mockResource, 50);
    assertEq(ResourceCount.get(playerEntity, mockResource), 50);
  }

  function testDecreaseStoredResourceNotEnoughResources() public {
    LibStorage.decreaseStoredResource(playerEntity, mockResource, 50);
    assertEq(ResourceCount.get(playerEntity, mockResource), 0);
  }

  function testIncreaseStoredResourceBelowMaxCap() public {
    MaxResourceCount.set(playerEntity, mockResource, 100);
    LibStorage.increaseStoredResource(playerEntity, mockResource, 50);
    assertEq(ResourceCount.get(playerEntity, mockResource), 50);
  }

  function testIncreaseStoredResourceAtMaxCap() public {
    MaxResourceCount.set(playerEntity, mockResource, 100);
    ResourceCount.set(playerEntity, mockResource, 100);
    LibStorage.increaseStoredResource(playerEntity, mockResource, 50);
    assertEq(ResourceCount.get(playerEntity, mockResource), 100);
  }

  function testIncreaseMaxUtility() public {
    LibStorage.increaseMaxUtility(playerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(playerEntity, mockResource), 20);
  }

  function testDecreaseMaxUtilityEnoughUtility() public {
    MaxResourceCount.set(playerEntity, mockResource, 50);
    LibStorage.decreaseMaxUtility(playerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(playerEntity, mockResource), 30);
  }

  function testDecreaseMaxUtilityNotEnoughUtility() public {
    LibStorage.decreaseMaxUtility(playerEntity, mockResource, 20);
    assertEq(MaxResourceCount.get(playerEntity, mockResource), 0);
  }

  function testDecreaseResourceUpdateScore() public {}
}
