// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "../PrimodiumTest.t.sol";

contract UpgradeRangeSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    spawn(creator);
    vm.startPrank(creator);
  }

  function testOutOfBounds() public {
    bytes32 creatorEntity = addressToEntity(creator);
    bytes32 asteroid = Home.getAsteroid(creatorEntity);

    Bounds memory bounds = LibBuilding.getSpaceRockBounds(asteroid);

    removeRequirements(EBuilding.IronMine);

    vm.expectRevert(bytes("[BuildSystem] Building out of bounds"));
    world.build(EBuilding.IronMine, PositionData(bounds.maxX + 1, bounds.maxY, asteroid));
  }

  function testUpgradeRangeWrongBaseLevelFail() public {
    bytes32 creatorEntity = addressToEntity(creator);
    Level.set(creatorEntity, 5);

    assertTrue(P_RequiredBaseLevel.get(ExpansionKey, 5) != 0, "should have expansion level 5");
    P_RequiredUpgradeResources.deleteRecord(ExpansionKey, 5);
    vm.expectRevert(bytes("[UpgradeRangeSystem] MainBase level requirement not met"));
    world.upgradeRange();
  }

  function testUpgradeRangeMaxLevel() public {
    bytes32 creatorEntity = addressToEntity(creator);
    // set player level to max level

    uint256 maxLevel = P_MaxLevel.get(ExpansionKey);
    bytes32[] memory keys = new bytes32[](1);

    Level.set(creatorEntity, maxLevel);
    assertEq(Level.get(creatorEntity), maxLevel);
    P_RequiredUpgradeResources.deleteRecord(ExpansionKey, maxLevel);
    vm.expectRevert(bytes("[UpgradeRangeSystem] Max level reached"));
    world.upgradeRange();
  }

  function testUpgradeRange() public {
    bytes32 creatorEntity = addressToEntity(creator);
    uint256 level = Level.get(creatorEntity);

    // increment creator's main base level by 1
    bytes32 mainBase = Home.getMainBase(creatorEntity);

    bytes32[] memory keys = new bytes32[](1);
    keys[0] = mainBase;

    Level.set(mainBase, level + 1);
    P_RequiredUpgradeResources.deleteRecord(ExpansionKey, level + 1);
    world.upgradeRange();
    assertEq(Level.get(creatorEntity), level + 1);
  }
}
