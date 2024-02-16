// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/ExtensionTest.t.sol";

contract UpgrBounSystemTest is ExtensionTest {
  function setUp() public override {
    super.setUp();
  }

  function testDepositBountyRepeatFail() public {
    vm.startPrank(alice);
    PositionData memory coord = PositionData(0, 0, ROOT_NAMESPACE);

    world.upgradeBounty_UpgrBounSystem_depositBounty(coord);
    vm.expectRevert("UpgrBounSystem: Bounty already exists");
    world.upgradeBounty_UpgrBounSystem_depositBounty(coord);
  }
}
