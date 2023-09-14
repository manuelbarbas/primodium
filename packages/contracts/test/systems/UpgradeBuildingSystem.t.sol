// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract UpgradeBuildingSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    spawn(alice);
  }

  function testUpgradeMaxedBuildingFail() public {
    vm.startPrank(alice);
    PositionData memory coord = getIronPosition(alice);
    bytes32 ironMine = world.build(EBuilding.IronMine, coord);
    uint32 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = ironMine;

    world.devSetRecord(LevelTableId, keys, Level.encode(ironMineMaxLevel), Level.getValueSchema());

    vm.expectRevert(bytes("[UpgradeBuildingSystem] Building has reached max level"));
    world.upgradeBuilding(coord);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    removeRequiredResources(EBuilding.IronMine);
    removeRequiredMainBase(EBuilding.IronMine);
    uint32 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);
    vm.startPrank(alice);
    PositionData memory coord = getIronPosition(alice);
    bytes32 ironMine = world.build(EBuilding.IronMine, coord);
    for (uint256 i = 1; i < ironMineMaxLevel; i++) {
      assertEq(Level.get(LibEncode.getHash(BuildingKey, coord)), i, "building should be level i");
      world.upgradeBuilding(coord);
    }

    vm.stopPrank();
  }

  function testUpgradeResourceRequirementsNotMetFail() public {
    vm.startPrank(alice);

    PositionData memory coord = getMainBasePosition(alice);
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);

    assertTrue(Level.get(buildingEntity) == 1);

    vm.expectRevert(bytes("[UpgradeBuildingSystem] You do not have the required resources"));
    world.upgradeBuilding(coord);
    vm.stopPrank();
  }
}
