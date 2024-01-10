// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract AccessSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 delegate;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    world.spawn();
    player = addressToEntity(creator);
    delegate = addressToEntity(alice);
  }

  function testSetDelegate() public {
    assertEq(OwnedBy.get(delegate), bytes32(0));
    assertEq(Delegate.get(player), bytes32(0));
    world.grantAccess(alice);
    assertEq(OwnedBy.get(delegate), player);
    assertEq(Delegate.get(player), delegate);
  }

  function testFailAlreadyHasDelegate() public {
    world.grantAccess(alice);
    world.grantAccess(alice);
  }

  function testFailSpawned() public {
    vm.stopPrank();
    spawn(alice);
    switchPrank(creator);
    world.grantAccess(alice);
  }

  function testSwitchDelegate() public {
    world.grantAccess(alice);
    assertEq(OwnedBy.get(delegate), player);
    assertEq(Delegate.get(player), delegate);

    world.switchDelegate(bob);

    assertEq(OwnedBy.get(delegate), bytes32(0), "delegate should be unowned");
    assertEq(OwnedBy.get(addressToEntity(bob)), player, "bob should be owned by player");
    assertEq(Delegate.get(player), addressToEntity(bob), "player should have bob as delegate");
  }

  function testRevokeAccessDelegate() public {
    world.grantAccess(alice);
    assertEq(OwnedBy.get(delegate), player);
    assertEq(Delegate.get(player), delegate);
    switchPrank(alice);
    world.revokeAccessDelegate();
    assertEq(OwnedBy.get(delegate), bytes32(0));
    assertEq(Delegate.get(player), bytes32(0));
  }

  function testRevokeAccessOwner() public {
    world.grantAccess(alice);
    assertEq(OwnedBy.get(delegate), player);
    assertEq(Delegate.get(player), delegate);
    world.revokeAccessOwner();
    assertEq(OwnedBy.get(delegate), bytes32(0));
    assertEq(Delegate.get(player), bytes32(0));
  }

  function testBuildOwner() public {
    world.grantAccess(alice);
    PositionData memory coord = getIronPosition(creator);

    world.build(EBuilding.IronMine, coord);

    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine));
    assertTrue(HasBuiltBuilding.get(player, buildingPrototype));
    assertFalse(HasBuiltBuilding.get(delegate, buildingPrototype));
  }

  function testBuildDelegate() public {
    world.grantAccess(alice);
    PositionData memory coord = getIronPosition(creator);

    switchPrank(alice);
    world.build(EBuilding.IronMine, coord);

    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine));
    assertTrue(HasBuiltBuilding.get(player, buildingPrototype));
    assertFalse(HasBuiltBuilding.get(delegate, buildingPrototype));
  }

  function testHighRiskActionDelegate() public {
    world.grantAccess(alice);

    bytes32 playerHome = Home.getAsteroid(player);
    LibProduction.increaseResourceProduction(playerHome, EResource.U_Orders, 1);
    ResourceCount.set(Home.getAsteroid(player), uint8(EResource.Iron), 100);
    switchPrank(alice);
    vm.expectRevert(bytes("[Access Control] Cannot delegate high risk actions"));
    world.addResourceOrder(EResource.Iron, 1, 1);
  }

  function testHighRiskActionOwner() public {
    world.grantAccess(alice);

    bytes32 playerHome = Home.getAsteroid(player);
    LibProduction.increaseResourceProduction(playerHome, EResource.U_Orders, 1);
    ResourceCount.set(Home.getAsteroid(player), uint8(EResource.Iron), 100);
    world.addResourceOrder(EResource.Iron, 1, 1);
  }
}
