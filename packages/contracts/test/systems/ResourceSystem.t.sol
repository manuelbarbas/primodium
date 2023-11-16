// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract ZogGemSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 otherEntity;
  bytes32 thirdEntity;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    otherEntity = addressToEntity(alice);
    thirdEntity = addressToEntity(bob);
  }

  function testTransfer() public {
    Balance.set(playerEntity, 100);
    world.transfer(otherEntity, 50);
    assertEq(Balance.get(playerEntity), 50);
    assertEq(Balance.get(otherEntity), 50);
  }

  function testFailTransferToSelf() public {
    world.transfer(playerEntity, 50);
  }

  function testTransferNotEnoughBalance() public {
    Balance.set(playerEntity, 40);

    vm.expectRevert(bytes("[ZogGemSystem] Not enough balance"));
    world.transfer(otherEntity, 50);
  }

  function testOverwriteAllowance() public {
    world.setTransferAllowance(otherEntity, 100);
    assertEq(TransferAllowance.get(playerEntity, otherEntity), 100);
    world.setTransferAllowance(otherEntity, 200);
    assertEq(TransferAllowance.get(playerEntity, otherEntity), 200);

    world.setTransferAllowance(otherEntity, 0);
    assertEq(TransferAllowance.get(playerEntity, otherEntity), 0);
  }

  function testTransferFrom() public {
    Balance.set(playerEntity, 50);
    Balance.set(playerEntity, 50);
    world.setTransferAllowance(otherEntity, 100);

    assertEq(TransferAllowance.get(playerEntity, otherEntity), 100);

    switchPrank(alice);
    world.transferFrom(playerEntity, otherEntity, 50);
    assertEq(Balance.get(playerEntity), 0, "player count wrong");
    assertEq(Balance.get(otherEntity), 50, "other count wrong");
  }

  function testFailUnauthorizedTransferFrom() public {
    world.transferFrom(thirdEntity, otherEntity, 50);
  }

  function testInfiniteAllowance() public {
    world.setTransferAllowance(otherEntity, type(uint256).max);
    assertEq(TransferAllowance.get(playerEntity, otherEntity), type(uint256).max);
  }
}
