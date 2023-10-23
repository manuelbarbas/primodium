// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { WorldResourceIdInstance, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

contract BuildSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 bobEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    playerEntity = addressToEntity(creator);
    bobEntity = addressToEntity(bob);
    vm.startPrank(creator);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testCreateAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Open);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));
    assertEq(Alliance.getName(allianceEntity), bytes32("myAliance"), "alliance name should be set");
    assertEq(
      Alliance.getInviteMode(allianceEntity),
      uint8(EAllianceInviteMode.Open),
      "alliance invite mode should be open"
    );
    assertEq(PlayerAlliance.getAlliance(playerEntity), allianceEntity, "player should be in alliance");
    assertEq(PlayerAlliance.getRole(playerEntity), uint8(EAllianceRole.Owner), "player should be alliance owner");
  }

  function testCreateAllianceClosed() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Closed);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));
    assertEq(Alliance.getName(allianceEntity), bytes32("myAliance"), "alliance name should be set");
    assertEq(
      Alliance.getInviteMode(allianceEntity),
      uint8(EAllianceInviteMode.Closed),
      "alliance invite mode should closed"
    );
    assertEq(PlayerAlliance.getAlliance(playerEntity), allianceEntity, "player should be in alliance");
    assertEq(PlayerAlliance.getRole(playerEntity), uint8(EAllianceRole.Owner), "player should be alliance owner");
  }

  function testJoinOpenAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Open);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));

    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);

    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testFailJoinClosedAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Closed);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));

    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);
  }

  function testInviteAndJoinAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Closed);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));
    world.invite(allianceEntity, bobEntity);
    assertEq(
      AllianceInvitation.get(bobEntity, allianceEntity),
      playerEntity,
      "bob should be invited to alliance by player"
    );
    vm.stopPrank();
    vm.startPrank(bob);
    world.join(allianceEntity);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testRequestToJoinAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Closed);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));
    vm.stopPrank();
    vm.startPrank(bob);
    world.requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity), "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.acceptRequestToJoin(bobEntity);
    assertEq(PlayerAlliance.getAlliance(bobEntity), allianceEntity, "bob should be in alliance");
    assertEq(PlayerAlliance.getRole(bobEntity), uint8(EAllianceRole.Member), "bob should be member");
  }

  function testRejectRequestToJoinAlliance() public {
    bytes rawAllianceEntity = world.create(creator, bytes32("myAliance"), EAllianceInviteMode.Closed);
    bytes32 allianceEntity = abi.decode(rawAllianceEntity, (bytes32));
    vm.stopPrank();
    vm.startPrank(bob);
    world.requestToJoin(allianceEntity);
    assertTrue(AllianceJoinRequest.get(bobEntity, allianceEntity), "bob should have requested to join alliance");
    vm.stopPrank();
    vm.startPrank(creator);
    world.rejectRequestToJoin(bobEntity);
    assertTrue(
      !AllianceJoinRequest.get(bobEntity, allianceEntity),
      "bobs request to join alliance should have been rejected"
    );
    assertEq(PlayerAlliance.getAlliance(bobEntity), 0, "bob should not be in alliance");
  }
}
