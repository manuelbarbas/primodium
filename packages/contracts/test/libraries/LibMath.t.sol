// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract LibMathTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testFuzzPositionByVector(uint32 distance, uint32 direction) public {
    distance = distance % 100_000;
    direction = direction % 720;
    PositionData memory destination = LibMath.getPositionByVector(distance, direction);
    uint32 reverseDirection = direction + 180;
    PositionData memory origin = LibMath.getPositionByVector(distance, reverseDirection);
    origin = PositionData(origin.x + destination.x, origin.y + destination.y, 0);
    assertEq(origin, PositionData(0, 0, 0));
  }

  function testPositionByVector() public {
    uint32 distance = 100;
    uint32 direction = 85;
    PositionData memory destination = LibMath.getPositionByVector(distance, direction);
    uint32 reverseDirection = direction + 180;
    PositionData memory origin = LibMath.getPositionByVector(distance, reverseDirection);
    origin = PositionData(origin.x + destination.x, origin.y + destination.y, 0);
    assertEq(origin, PositionData(0, 0, 0));
  }

  function testPrintPositions() public view {
    uint32 distance = 100;
    uint32 max = 13;
    for (uint32 i = 0; i < max; i++) {
      PositionData memory coord = LibMath.getPositionByVector(distance, (i * 360) / max);
      logPosition(coord);
    }
  }
}
