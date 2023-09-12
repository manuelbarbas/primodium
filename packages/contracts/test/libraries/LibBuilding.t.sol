// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

contract LibBuildingTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
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

    spawn(alice);
    vm.startPrank(alice);

    bytes32[] memory keys = new bytes32[](0);

    world.devSetRecord(P_AsteroidTableId, keys, P_Asteroid.encode(maxX, maxY), P_Asteroid.getValueSchema());

    bytes32 playerEntity = addressToEntity(alice);
    uint32 playerLevel = Level.get(playerEntity);

    keys = new bytes32[](2);
    keys[0] = ExpansionKey;
    keys[1] = bytes32(uint256(playerLevel));

    DimensionsData memory curr = DimensionsData(int32(currX), int32(currY));
    world.devSetRecord(DimensionsTableId, keys, Dimensions.encode(currX, currY), Dimensions.getValueSchema());

    Bounds memory bounds = LibBuilding.getPlayerBounds(playerEntity);
    console.log("maxX", uint32(bounds.maxX));
    console.log("maxY", uint32(bounds.maxY));
    console.log("minX", uint32(bounds.minX));
    console.log("minY", uint32(bounds.minY));

    assertEq(bounds.minX, (maxX - curr.x) / 2);
    assertEq(bounds.maxX, (maxX + curr.x) / 2 - 1);
    assertEq(bounds.minY, (maxY - curr.y) / 2);
    assertEq(bounds.maxY, (maxY + curr.y) / 2 - 1);

    // Check that the bound size matches with the current player dimensions
    assertEq(curr.x, bounds.maxX - bounds.minX + 1);
    assertEq(curr.y, bounds.maxY - bounds.minY + 1);
  }

  function testGetActualBounds() public {
    spawn(alice);
    vm.startPrank(alice);

    bytes32 playerEntity = addressToEntity(alice);

    Bounds memory bounds = LibBuilding.getPlayerBounds(playerEntity);
    console.log("maxX", uint32(bounds.maxX));
    console.log("maxY", uint32(bounds.maxY));
    console.log("minX", uint32(bounds.minX));
    console.log("minY", uint32(bounds.minY));
  }
}
