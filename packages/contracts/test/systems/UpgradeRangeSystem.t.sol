// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "../PrimodiumTest.t.sol";

contract UpgradeRangeSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    spawn(worldAddress);
    vm.startPrank(creator);
  }

  function testOutOfBounds() public {
    bytes32 aliceEntity = addressToEntity(alice);
    bytes32 asteroid = Home.getAsteroid(aliceEntity);

    Bounds memory bounds = LibBuilding.getPlayerBounds(aliceEntity);

    removeRequirements(EBuilding.IronMine);

    vm.expectRevert(bytes("[BuildSystem] Building out of bounds"));
    world.build(EBuilding.IronMine, PositionData(bounds.maxX + 1, bounds.maxY, asteroid));
  }

  function testUpgradeRangeWrongBaseLevelFail() public {
    bytes32 aliceEntity = addressToEntity(alice);
    vm.startPrank(alice);
    Level.set(aliceEntity, 5);

    assertTrue(P_RequiredBaseLevel.get(ExpansionKey, 5) != 0, "should have expansion level 5");
    vm.expectRevert(bytes("[UpgradeRangeSystem] MainBase level requirement not met"));
    world.upgradeRange();
  }

  function testUpgradeRangeMaxLevel() public {
    bytes32 aliceEntity = addressToEntity(alice);
    vm.startPrank(alice);
    // set player level to max level

    uint256 maxLevel = P_MaxLevel.get(ExpansionKey);
    bytes32[] memory keys = new bytes32[](1);

    Level.set(aliceEntity, maxLevel);
    assertEq(Level.get(aliceEntity), maxLevel);

    vm.expectRevert(bytes("[UpgradeRangeSystem] Max level reached"));
    world.upgradeRange();
  }

  function testUpgradeRange() public {
    bytes32 aliceEntity = addressToEntity(alice);
    vm.startPrank(alice);
    uint256 level = Level.get(aliceEntity);

    // increment alice's main base level by 1
    bytes32 mainBase = Home.getMainBase(aliceEntity);

    bytes32[] memory keys = new bytes32[](1);
    keys[0] = mainBase;

    Level.set(mainBase, level + 1);

    world.upgradeRange();
    assertEq(Level.get(aliceEntity), level + 1);
  }
}
