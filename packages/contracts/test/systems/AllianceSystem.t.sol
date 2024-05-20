// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumTest, console } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { AlliancePointContribution, Points, Alliance, PlayerAlliance, AllianceInvitation, AllianceJoinRequest, P_AllianceConfig } from "codegen/index.sol";
import { EAllianceInviteMode, EAllianceRole, EPointType } from "src/Types.sol";

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
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
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
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
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
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);

    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testFailJoinClosedAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    assertEq(AllianceMemberSet.length(allianceEntity), 1, "alliance should have 1 member");
  }

  function testInviteAndJoinAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    world.Pri_11__invite(bob);
    assertEq(
      AllianceInvitation.getInviter(bobEntity, allianceEntity),
      playerEntity,
      "bob should be invited to alliance by player"
    );
    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);
    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.Pri_11__acceptRequestToJoin(bob);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testRejectRequestToJoinAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Closed);

    vm.stopPrank();
    vm.startPrank(bob);
    world.Pri_11__requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity) != 0, "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.Pri_11__rejectRequestToJoin(bob);
    assertTrue(
      AllianceJoinRequest.get(bobEntity, allianceEntity) == 0,
      "bobs request to join alliance should have been rejected"
    );
    assertEq(PlayerAlliance.getAlliance(bobEntity), 0, "bob should not be in alliance");
  }

  function testCanInviteAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__invite(alice);
    vm.stopPrank();
    assertEq(
      AllianceInvitation.getInviter(aliceEntity, allianceEntity),
      bobEntity,
      "alice should be invited to alliance by bob"
    );
  }

  function testCanKickAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    assertEq(AllianceMemberSet.length(allianceEntity), 3, "alliance should have 3 member");
    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__kick(alice);
    vm.stopPrank();
    assertEq(AllianceMemberSet.length(allianceEntity), 2, "alliance should have 2 member");
  }

  function testPointsKick() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    Points.set(bobEntity, uint8(EPointType.Wormhole), 100);
    Points.set(bobEntity, uint8(EPointType.Shard), 500);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 0, "alliance should have 0 points");
    assertEq(Points.get(allianceEntity, uint8(EPointType.Shard)), 0, "alliance should have 0 points");

    vm.prank(creator);
    Points.set(bobEntity, uint8(EPointType.Wormhole), 200);

    assertEq(
      AlliancePointContribution.get(allianceEntity, uint8(EPointType.Wormhole), bobEntity),
      100,
      "wormhole points should be 100"
    );
    assertEq(
      AlliancePointContribution.get(allianceEntity, uint8(EPointType.Shard), bobEntity),
      0,
      "conquest points should be 100"
    );
    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 100, "alliance should have 100 points");

    vm.startPrank(creator);
    world.Pri_11__kick(bob);

    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 0, "alliance should have 0 points");
    assertEq(Points.get(bobEntity, uint8(EPointType.Wormhole)), 200, "bob should have 200 points");
  }

  function testPointsLeave() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    Points.set(bobEntity, uint8(EPointType.Wormhole), 100);
    Points.set(bobEntity, uint8(EPointType.Shard), 500);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 0, "alliance should have 0 points");
    assertEq(Points.get(allianceEntity, uint8(EPointType.Shard)), 0, "alliance should have 0 points");

    vm.prank(creator);
    Points.set(bobEntity, uint8(EPointType.Wormhole), 200);

    assertEq(
      AlliancePointContribution.get(allianceEntity, uint8(EPointType.Wormhole), bobEntity),
      100,
      "wormhole points should be 100"
    );
    assertEq(
      AlliancePointContribution.get(allianceEntity, uint8(EPointType.Shard), bobEntity),
      0,
      "conquest points should be 100"
    );
    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 100, "alliance should have 100 points");

    vm.startPrank(bob);
    world.Pri_11__leave();

    assertEq(Points.get(allianceEntity, uint8(EPointType.Wormhole)), 0, "alliance should have 0 points");
    assertEq(Points.get(bobEntity, uint8(EPointType.Wormhole)), 200, "bob should have 200 points");
  }
  function testCanGrantRoleAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__grantRole(alice, EAllianceRole.CanKick);
    assertEq(PlayerAlliance.getRole(aliceEntity), uint8(EAllianceRole.CanKick), "alice should be able to kick");
    vm.stopPrank();
  }

  function testDeclineInvitation() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    world.Pri_11__invite(bob);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__declineInvite(creator);
    vm.stopPrank();

    assertEq(AllianceInvitation.getInviter(allianceEntity, playerEntity), 0);
    assertEq(AllianceInvitation.getTimeStamp(allianceEntity, playerEntity), 0);
  }

  function testFailCantGrantRoleAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailCantGrantRoleToSuperiorAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanKick);
    world.Pri_11__grantRole(bob, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();
  }

  function testFailKickAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__kick(alice);
    vm.stopPrank();
  }

  function testFailKickWithoutRequiredRoleAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanInvite);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__kick(alice);
    vm.stopPrank();
  }

  function testFailKickSuperiorRoleAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanKick);
    world.Pri_11__grantRole(alice, EAllianceRole.CanKick);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__kick(alice);
    vm.stopPrank();
  }

  function testFailGrantRoleHigherAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanGrantRole);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__grantRole(alice, EAllianceRole.Owner);
    vm.stopPrank();
  }

  function testGrantOwnerRoleAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.Owner);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
    vm.stopPrank();
  }

  function testOwnerLeaveAlliance() public {
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__grantRole(bob, EAllianceRole.CanGrantRole);
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.CanGrantRole), "bob should be can grant role");
    vm.stopPrank();

    vm.startPrank(creator);
    world.Pri_11__leave();
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Owner), "bob should be owner");
  }

  function testFailAllianceFull() public {
    P_AllianceConfig.set(2);
    bytes32 allianceEntity = world.Pri_11__create(bytes32("myAlliance"), EAllianceInviteMode.Open);
    vm.stopPrank();

    vm.startPrank(bob);
    world.Pri_11__join(allianceEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__join(allianceEntity);
  }
}
