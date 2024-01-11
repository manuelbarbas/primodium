// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { UserDelegationControl } from "@latticexyz/world/src/codegen/index.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { UNLIMITED_DELEGATION } from "@latticexyz/world/src/constants.sol";

contract AccessSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    world.spawn();
  }

  function testSetUnlimitedDelegate() public {
    assertEq(ResourceId.unwrap(UserDelegationControl.get(creator, alice)), bytes32(""));
    world.registerDelegation(alice, UNLIMITED_DELEGATION, new bytes(0));
    assertEq(ResourceId.unwrap(UserDelegationControl.get(creator, alice)), ResourceId.unwrap(UNLIMITED_DELEGATION));
  }
}
