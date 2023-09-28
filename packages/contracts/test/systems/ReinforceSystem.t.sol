// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

// NOTE: core functionality is tested in LibReinforceTest.t.sol
contract ReinforceSystemTest is PrimodiumTest {
  bytes32 rock = "rock";
  bytes32 player;

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
  }

  function testReinforceNotOwned() public {
    OwnedBy.set(rock, "notPlayer");
    vm.expectRevert("[Reinforce] Rock not owned by sender");
    world.reinforce(rock, "arrival");
  }
}
