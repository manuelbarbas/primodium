// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract ResourceSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 otherEntity;
  bytes32 thirdEntity;
  uint8 iron = uint8(EResource.Iron);

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    otherEntity = addressToEntity(alice);
    thirdEntity = addressToEntity(bob);
  }

  function testTransfer() public {
    MaxResourceCount.set(playerEntity, iron, 100);
    MaxResourceCount.set(otherEntity, iron, 100);
    ResourceCount.set(playerEntity, iron, 100);
    world.transfer(otherEntity, EResource.Iron, 50);
    assertEq(ResourceCount.get(playerEntity, iron), 50);
    assertEq(ResourceCount.get(otherEntity, iron), 50);
  }

  function testTransferMaxResource() public {
    MaxResourceCount.set(playerEntity, iron, 100);
    MaxResourceCount.set(otherEntity, iron, 40);
    ResourceCount.set(playerEntity, iron, 100);

    world.transfer(otherEntity, EResource.Iron, 50);
    assertEq(ResourceCount.get(playerEntity, iron), 50);
    assertEq(ResourceCount.get(otherEntity, iron), 40);
  }

  function testFailTransferToSelf() public {
    world.transfer(playerEntity, EResource.Iron, 50);
  }

  function testTransferNotEnoughResourceStorage() public {
    MaxResourceCount.set(playerEntity, iron, 100);
    MaxResourceCount.set(otherEntity, iron, 100);
    ResourceCount.set(playerEntity, iron, 40);

    vm.expectRevert(bytes("[ResourceSystem] Not enough resources"));
    world.transfer(otherEntity, EResource.Iron, 50);
  }

  function testOverwriteAllowance() public {
    world.setTransferAllowance(otherEntity, EResource.Iron, 100);
    assertEq(TransferAllowance.get(playerEntity, otherEntity, iron), 100);
    world.setTransferAllowance(otherEntity, EResource.Iron, 200);
    assertEq(TransferAllowance.get(playerEntity, otherEntity, iron), 200);

    world.setTransferAllowance(otherEntity, EResource.Iron, 0);
    assertEq(TransferAllowance.get(playerEntity, otherEntity, iron), 0);
  }

  function testTransferFrom() public {
    MaxResourceCount.set(playerEntity, iron, 100);
    MaxResourceCount.set(otherEntity, iron, 100);

    ResourceCount.set(playerEntity, iron, 50);
    ResourceCount.set(playerEntity, iron, 50);
    world.setTransferAllowance(otherEntity, EResource.Iron, 100);

    assertEq(TransferAllowance.get(playerEntity, otherEntity, iron), 100);

    switchPrank(alice);
    world.transferFrom(playerEntity, otherEntity, EResource.Iron, 50);
    assertEq(ResourceCount.get(playerEntity, iron), 0, "player count wrong");
    assertEq(ResourceCount.get(otherEntity, iron), 50, "other count wrong");
  }

  function testFailUnauthorizedTransferFrom() public {
    world.transferFrom(thirdEntity, otherEntity, EResource.Iron, 50);
  }

  function testInfiniteAllowance() public {
    world.setTransferAllowance(otherEntity, EResource.Iron, type(uint256).max);
    assertEq(TransferAllowance.get(playerEntity, otherEntity, iron), type(uint256).max);
  }
}
