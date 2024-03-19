// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "test/PrimodiumTest.t.sol";
import { WorldResourceIdInstance, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

contract AllianceSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 bobEntity;
  bytes32 aliceEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    spawn(alice);
    playerEntity = addressToEntity(creator);
    bobEntity = addressToEntity(bob);
    aliceEntity = addressToEntity(alice);
    vm.startPrank(creator);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testCreateAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    assertEq(Alliance.getName(allianceEntity), bytes32("myAlliance"), "alliance name should be set");
    assertEq(
      Alliance.getInviteMode(allianceEntity),
      uint8(EAllianceInviteMode.Open),
      "alliance invite mode should be open"
    );
    assertEq(PlayerAlliance.getAlliance(playerEntity), allianceEntity, "player should be in alliance");
    assertEq(PlayerAlliance.getRole(playerEntity), uint8(EAllianceRole.Owner), "player should be alliance owner");
    assertEq(AllianceMembersSet.length(allianceEntity), 1, "alliance should have 1 member");
  }

  function testCreateAllianceClosed() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    assertEq(Alliance.getName(allianceEntity), bytes32("myAlliance"), "alliance name should be set");
    assertEq(
      Alliance.getInviteMode(allianceEntity),
      uint8(EAllianceInviteMode.Closed),
      "alliance invite mode should closed"
    );
    assertEq(PlayerAlliance.getAlliance(playerEntity), allianceEntity, "player should be in alliance");
    assertEq(PlayerAlliance.getRole(playerEntity), uint8(EAllianceRole.Owner), "player should be alliance owner");
  }

  function testJoinOpenAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);

    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);

    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMembersSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testFailJoinClosedAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);
    assertEq(AllianceMembersSet.length(allianceEntity), 1, "alliance should have 1 member");
  }

  function testInviteAndJoinAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    world.invite(bob);
    assertEq(
      AllianceInvitation.getInviter(bobEntity, allianceEntity),
      playerEntity,
      "bob should be invited to alliance by player"
    );
    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMembersSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    vm.stopPrank();
    vm.startPrank(bob);
    world.requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.acceptRequestToJoin(bob);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testRejectRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.rejectRequestToJoin(bob);
    assertTrue(
      AllianceJoinRequest.get(bobEntity, allianceEntity) == 0,
      "bobs request to join alliance should have been rejected"
    );
    assertEq(PlayerAlliance.getAlliance(bobEntity), 0, "bob should not be in alliance");
  }

  function testCanInviteAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.invite(alice);
    vm.stopPrank();
    assertEq(
      AllianceInvitation.getInviter(aliceEntity, allianceEntity),
      bobEntity,
      "alice should be invited to alliance by bob"
    );
  }

  function testCanKickAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    assertEq(AllianceMembersSet.length(allianceEntity), 3, "alliance should have 3 member");
    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.kick(alice);
    vm.stopPrank();
    assertEq(AllianceMembersSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testCanGrantRoleAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.grantRole(alice, EAllianceRole.CanKick);
    assertEq(PlayerAlliance.getRole(aliceEntity), uint8(EAllianceRole.CanKick), "alice should be able to kick");
    vm.stopPrank();
  }

  function testDeclineInvitation() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    world.invite(bob);
    vm.stopPrank();

    vm.startPrank(bob);
    world.declineInvite(creator);
    vm.stopPrank();

    assertEq(AllianceInvitation.getInviter(allianceEntity, playerEntity), 0);
    assertEq(AllianceInvitation.getTimeStamp(allianceEntity, playerEntity), 0);
  }

  function testFailCantGrantRoleAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailCantGrantRoleToSuperiorAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanKick);
    world.grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailKickAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.kick(alice);
    vm.stopPrank();
  }

  function testFailKickWithoutRequiredRoleAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.kick(alice);
    vm.stopPrank();
  }

  function testFailKickSuperiorRoleAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanKick);
    world.grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.kick(alice);
    vm.stopPrank();
  }

  function testFailGrantRoleHigherAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.grantRole(alice, EAllianceRole.Owner);
    vm.stopPrank();
  }

  function testGrantOwnerRoleAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.Owner);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
    vm.stopPrank();
  }

  function testOwnerLeaveAlliance() public {
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.grantRole(bob, EAllianceRole.CanGrantRole);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.CanGrantRole), "bob should be can grant role");
    vm.stopPrank();

    vm.startPrank(creator);
    world.leave();
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
  }

  function testFailAllianceFull() public {
    P_AllianceConfig.set(2);
    bytes32 allianceEntity = world.create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.join(allianceEntity);
  }
}
