// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibBuildingTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    spawn(creator);
    vm.startPrank(creator);
  }

  function testGetPlayerBounds(
    int16 maxX,
    int16 maxY,
    int16 currX,
    int16 currY
  ) public {
    // Bound fuzzy parameters to int16 to eliminate overflow errors when testing
    vm.assume(currX > 0);
    vm.assume(currY > 0);
    vm.assume(maxX >= currX);
    vm.assume(maxY >= currY);

    bytes32[] memory keys = new bytes32[](0);

    P_Asteroid.set(maxX, maxY);

    bytes32 playerEntity = addressToEntity(alice);
    uint256 playerLevel = Level.get(playerEntity);

    Dimensions.set(ExpansionKey, playerLevel, currX, currY);

    Bounds memory bounds = LibBuilding.getPlayerBounds(playerEntity);

    assertEq(bounds.minX, (maxX - currX) / 2);
    assertEq(bounds.maxX, (maxX + currX) / 2 - 1);
    assertEq(bounds.minY, (maxY - currY) / 2);
    assertEq(bounds.maxY, (maxY + currY) / 2 - 1);

    // Check that the bound size matches with the current player dimensions
    assertEq(currX, bounds.maxX - bounds.minX + 1);
    assertEq(currY, bounds.maxY - bounds.minY + 1);
  }
}
