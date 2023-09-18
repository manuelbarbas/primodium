// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract CounterTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  function testWorldExists() public {
    uint256 codeSize;
    address addr = worldAddress;
    assembly {
      codeSize := extcodesize(addr)
    }
    assertTrue(codeSize > 0);
  }

  function testCounter() public {
    // Expect the counter to be 1 because it was incremented in the PostDeploy script.
    uint256 counter = Counter.get(world);
    assertEq(counter, 1);

    // Expect the counter to be 2 after calling increment.
    world.increment();
    counter = Counter.get(world);
    assertEq(counter, 2);
  }
}
