// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumTest, console } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { Alliance, PlayerAlliance, AllianceInvitation, AllianceJoinRequest, P_AllianceConfig } from "codegen/index.sol";
import { EAllianceInviteMode, EAllianceRole } from "src/Types.sol";

import { AllianceMemberSet } from "libraries/AllianceMemberSet.sol";

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
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    assertEq(Alliance.getName(allianceEntity), bytes32("myAlliance"), "alliance name should be set");
    assertEq(
      Alliance.getInviteMode(allianceEntity),
      uint8(EAllianceInviteMode.Open),
      "alliance invite mode should be open"
    );
    assertEq(PlayerAlliance.getAlliance(playerEntity), allianceEntity, "player should be in alliance");
    assertEq(PlayerAlliance.getRole(playerEntity), uint8(EAllianceRole.Owner), "player should be alliance owner");
    assertEq(AllianceMemberSet.length(allianceEntity), 1, "alliance should have 1 member");
  }

  function testCreateAllianceClosed() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
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
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);

    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testFailJoinClosedAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    assertEq(AllianceMemberSet.length(allianceEntity), 1, "alliance should have 1 member");
  }

  function testInviteAndJoinAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    world.Primodium__invite(bob);
    assertEq(
      AllianceInvitation.getInviter(bobEntity, allianceEntity),
      playerEntity,
      "bob should be invited to alliance by player"
    );
    vm.stopPrank();
    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    vm.stopPrank();
    vm.startPrank(bob);
    world.Primodium__requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.Primodium__acceptRequestToJoin(bob);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testRejectRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Primodium__requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.Primodium__rejectRequestToJoin(bob);
    assertTrue(
      AllianceJoinRequest.get(bobEntity, allianceEntity) == 0,
      "bobs request to join alliance should have been rejected"
    );
    assertEq(PlayerAlliance.getAlliance(bobEntity), 0, "bob should not be in alliance");
  }

  function testCanInviteAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__invite(alice);
    vm.stopPrank();
    assertEq(
      AllianceInvitation.getInviter(aliceEntity, allianceEntity),
      bobEntity,
      "alice should be invited to alliance by bob"
    );
  }

  function testCanKickAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    assertEq(AllianceMemberSet.length(allianceEntity), 3, "alliance should have 3 member");
    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__kick(alice);
    vm.stopPrank();
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testCanGrantRoleAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__grantRole(alice, EAllianceRole.CanKick);
    assertEq(PlayerAlliance.getRole(aliceEntity), uint8(EAllianceRole.CanKick), "alice should be able to kick");
    vm.stopPrank();
  }

  function testDeclineInvitation() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    world.Primodium__invite(bob);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__declineInvite(creator);
    vm.stopPrank();

    assertEq(AllianceInvitation.getInviter(allianceEntity, playerEntity), 0);
    assertEq(AllianceInvitation.getTimeStamp(allianceEntity, playerEntity), 0);
  }

  function testFailCantGrantRoleAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailCantGrantRoleToSuperiorAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanKick);
    world.Primodium__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailKickAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__kick(alice);
    vm.stopPrank();
  }

  function testFailKickWithoutRequiredRoleAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__kick(alice);
    vm.stopPrank();
  }

  function testFailKickSuperiorRoleAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanKick);
    world.Primodium__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__kick(alice);
    vm.stopPrank();
  }

  function testFailGrantRoleHigherAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__grantRole(alice, EAllianceRole.Owner);
    vm.stopPrank();
  }

  function testGrantOwnerRoleAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.Owner);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
    vm.stopPrank();
  }

  function testOwnerLeaveAlliance() public {
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__grantRole(bob, EAllianceRole.CanGrantRole);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.CanGrantRole), "bob should be can grant role");
    vm.stopPrank();

    vm.startPrank(creator);
    world.Primodium__leave();
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
  }

  function testFailAllianceFull() public {
    P_AllianceConfig.set(2);
    bytes32 allianceEntity = world.Primodium__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Primodium__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__join(allianceEntity);
  }
}
