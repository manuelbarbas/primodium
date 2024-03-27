// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// tables
import { P_AllianceConfig, AllianceJoinRequest, PlayerAlliance, Alliance, AllianceData, AllianceInvitation } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { AllianceMemberSet } from "libraries/AllianceMemberSet.sol";

// types
import { AllianceKey } from "src/Keys.sol";
import { EAllianceRole, EAllianceInviteMode } from "src/Types.sol";

library LibAlliance {
  /**
   * @dev Checks for a player not to be part of an alliance.
   * @param playerEntity The entity ID of the player.
   */
  modifier onlyNotMemberOfAlliance(bytes32 playerEntity) {
    require(PlayerAlliance.getAlliance(playerEntity) == 0, "[Alliance] Player is already part of an alliance");
    _;
  }

  /**
   * @dev Checks if a player is part of an alliance.
   * @param playerEntity The entity ID of the player.
   * @param allianceEntity The entity ID of the alliance.
   */
  modifier onlyPartOfAlliance(bytes32 playerEntity, bytes32 allianceEntity) {
    require(
      PlayerAlliance.getAlliance(playerEntity) == allianceEntity,
      "[Alliance] Player is not part of the alliance"
    );
    _;
  }

  /**
   * @dev Checks if a alliance has space for new member.
   * @param allianceEntity The entity ID of the alliance.
   */
  modifier onlyAllianceNotFull(bytes32 allianceEntity) {
    require(AllianceMemberSet.length(allianceEntity) < P_AllianceConfig.get(), "[Alliance] Alliance is full");
    _;
  }

  /**
   * @dev Checks if a new player can join an alliance.
   * @param playerEntity The entity ID of the player.
   * @param allianceEntity The entity ID of the alliance.
   */
  modifier onlyCanJoinAlliance(bytes32 playerEntity, bytes32 allianceEntity) {
    bytes32 inviter = AllianceInvitation.getInviter(playerEntity, allianceEntity);
    require(
      Alliance.getInviteMode(allianceEntity) == uint8(EAllianceInviteMode.Open) || inviter != 0,
      "[Alliance] Either alliance is not open or player has not been invited"
    );
    _;
  }

  /**
   * @dev Checks if the player can grant a role to another player.
   * @param grantingEntity The entity ID of the player granting the role.
   * @param grantedEntity The entity ID of the player receiving the new role.
   * @param role The role
   */
  modifier onlyCanGrantRole(
    bytes32 grantingEntity,
    bytes32 grantedEntity,
    EAllianceRole role
  ) {
    require(grantingEntity != grantedEntity, "[Alliance] Can not grant role to self");
    uint8 grantingEntityRole = PlayerAlliance.getRole(grantingEntity);
    require(grantingEntityRole <= uint8(role), "[Alliance] Can not grant role higher than your own");
    require(
      grantingEntityRole > 0 && grantingEntityRole <= uint8(EAllianceRole.CanGrantRole),
      "[Alliance] Does not have permission to grant role"
    );
    require(grantingEntityRole < PlayerAlliance.getRole(grantedEntity), "[Alliance] Can not change role of superior");
    _;
  }

  /**
   * @dev Checks if the player can kick another player from the alliance.
   * @param playerEntity The entity ID of the player.
   * @param kickedEntity The entity ID of the player getting KICKED
   */
  modifier onlyCanKick(bytes32 playerEntity, bytes32 kickedEntity) {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanKick), "[Alliance] Player does not have permission to kick");
    require(role < PlayerAlliance.getRole(kickedEntity), "[Alliance] Can not kick superior");
    _;
  }

  modifier onlyCanReject(bytes32 playerEntity) {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanKick), "[Alliance] Does not have permission to reject");
    _;
  }

  /**
   * @dev Checks if the player can invite another player to the alliance or accept a join request.
   * @param playerEntity The entity ID of the player.
   * @param targetEntity The entity ID of the request target.
   */
  modifier onlyCanInviteOrAcceptJoinRequest(bytes32 playerEntity, bytes32 targetEntity) {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(
      role > 0 && role <= uint8(EAllianceRole.CanInvite),
      "[Alliance] Does not have permission to invite players"
    );
    require(
      PlayerAlliance.getAlliance(targetEntity) != PlayerAlliance.getAlliance(playerEntity),
      "[Alliance] Player is already part of the alliance"
    );
    _;
  }

  /**
   * @dev Checks if the player can revoke the invite to another player or reject a join request.
   * @param inviterEntity The entity ID of the inviter.
   * @param inviteeEntity The entity ID of the invitee.
   */
  modifier onlyCanRevokeInvite(bytes32 inviterEntity, bytes32 inviteeEntity) {
    uint8 role = PlayerAlliance.getRole(inviterEntity);
    require(
      (role > 0 && role <= uint8(EAllianceRole.CanKick)) ||
        AllianceInvitation.getInviter(inviteeEntity, PlayerAlliance.getAlliance(inviterEntity)) == inviterEntity,
      "[Alliance] Does not have permission to revoke invite"
    );
    _;
  }

  modifier onlyCanCreateAlliance(bytes32 playerEntity) {
    require(PlayerAlliance.getAlliance(playerEntity) == 0, "[Alliance] Player is already part of an alliance");
    _;
  }

  modifier onlyCanLeaveAlliance(bytes32 playerEntity) {
    require(PlayerAlliance.getRole(playerEntity) != uint8(EAllianceRole.Owner), "[Alliance] Owner can not leave");
    _;
  }

  /**
   * @dev try to join an alliance
   * @param playerEntity The entity ID of the player.
   * @param allianceEntity the entity ID of the alliance.
   */
  function join(
    bytes32 playerEntity,
    bytes32 allianceEntity
  )
    internal
    onlyNotMemberOfAlliance(playerEntity)
    onlyAllianceNotFull(allianceEntity)
    onlyCanJoinAlliance(playerEntity, allianceEntity)
  {
    PlayerAlliance.set(playerEntity, allianceEntity, uint8(EAllianceRole.Member));
    AllianceInvitation.deleteRecord(playerEntity, allianceEntity);
    AllianceMemberSet.add(allianceEntity, playerEntity);
  }

  /**
   * @dev create an alliance
   * @param playerEntity The entity ID of the player.
   * @param name The name of the alliance.
   * @param allianceInviteMode The mode of the alliance invite
   */
  function create(
    bytes32 playerEntity,
    bytes32 name,
    EAllianceInviteMode allianceInviteMode
  ) internal onlyNotMemberOfAlliance(playerEntity) returns (bytes32 allianceEntity) {
    allianceEntity = LibEncode.getHash(AllianceKey, playerEntity);
    PlayerAlliance.set(playerEntity, allianceEntity, uint8(EAllianceRole.Owner));
    Alliance.set(allianceEntity, AllianceData(name, 0, uint8(allianceInviteMode)));
    AllianceMemberSet.add(allianceEntity, playerEntity);
  }

  /**
   * @dev leave an alliance
   * @param playerEntity The entity ID of the playerEntity.
   */
  function leave(bytes32 playerEntity) internal {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);
    if (allianceEntity == 0) return;
    AllianceMemberSet.remove(allianceEntity, playerEntity);
    if (PlayerAlliance.getRole(playerEntity) == uint8(EAllianceRole.Owner)) {
      if (AllianceMemberSet.length(allianceEntity) == 0) {
        Alliance.deleteRecord(allianceEntity);
        PlayerAlliance.deleteRecord(playerEntity);
        return;
      }
      bytes32[] memory memberEntities = AllianceMemberSet.getMembers(allianceEntity);
      bytes32 currEntity = memberEntities[0];
      for (uint256 i = 0; i < memberEntities.length; i++) {
        if (PlayerAlliance.getRole(memberEntities[i]) < PlayerAlliance.getRole(currEntity)) {
          currEntity = memberEntities[i];
        }
      }
      PlayerAlliance.set(currEntity, allianceEntity, uint8(EAllianceRole.Owner));
    }
    PlayerAlliance.deleteRecord(playerEntity);
  }

  /**
   * @dev invite a player to an alliance
   * @param playerEntity The entity ID of the player.
   * @param targetEntity The entity ID of the target.
   */
  function invite(
    bytes32 playerEntity,
    bytes32 targetEntity
  ) internal onlyCanInviteOrAcceptJoinRequest(playerEntity, targetEntity) {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);
    AllianceInvitation.set(targetEntity, allianceEntity, playerEntity, block.timestamp);
  }

  /**
   * @dev revoke an invite to an alliance
   * @param inviterEntity The entity ID of the player who created invite.
   * @param inviteeEntity the entity id of the player invited to join
   */
  function revokeInvite(
    bytes32 inviterEntity,
    bytes32 inviteeEntity
  ) internal onlyCanRevokeInvite(inviterEntity, inviteeEntity) {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(inviterEntity);
    AllianceInvitation.deleteRecord(inviteeEntity, allianceEntity);
  }

  /**
   * @dev kick a player from an alliance
   * @param playerEntity The entity ID of the player kicking.
   * @param targetEntity the entity id of the player to kick
   */
  function kick(bytes32 playerEntity, bytes32 targetEntity) internal onlyCanKick(playerEntity, targetEntity) {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);
    PlayerAlliance.deleteRecord(targetEntity);
    AllianceMemberSet.remove(allianceEntity, targetEntity);
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param granterEntity The entity ID of the player granting the role.
   * @param targetEntity The entity ID of the player being granted the role.
   * @param role The role to grant.
   */
  function grantRole(
    bytes32 granterEntity,
    bytes32 targetEntity,
    EAllianceRole role
  ) internal onlyCanGrantRole(granterEntity, targetEntity, role) {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(granterEntity);
    PlayerAlliance.set(targetEntity, allianceEntity, uint8(role));

    //if the role being granted is Owner, then the granter loses that role and becomes CanGrantRole
    if (role == EAllianceRole.Owner) {
      PlayerAlliance.set(granterEntity, allianceEntity, uint8(EAllianceRole.CanGrantRole));
    }
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param playerEntity The entity ID of the player who is requesting to join.
   * @param allianceEntity The entity ID of the alliance the player has requested to join.
   */
  function requestToJoin(bytes32 playerEntity, bytes32 allianceEntity) internal {
    AllianceJoinRequest.set(playerEntity, allianceEntity, block.timestamp);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param playerEntity The entity ID of the player who is rejecting the request to join.
   * @param rejectedEntity The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(bytes32 playerEntity, bytes32 rejectedEntity) internal onlyCanReject(playerEntity) {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);
    AllianceJoinRequest.deleteRecord(rejectedEntity, allianceEntity);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param playerEntity The entity ID of the player who is accepting the request to join.
   * @param acceptedEntity The entity ID of the the player who has requested to join.
   */
  function acceptRequestToJoin(
    bytes32 playerEntity,
    bytes32 acceptedEntity
  )
    internal
    onlyCanInviteOrAcceptJoinRequest(playerEntity, acceptedEntity)
    onlyAllianceNotFull(PlayerAlliance.getAlliance(playerEntity))
  {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);
    PlayerAlliance.set(acceptedEntity, allianceEntity, uint8(EAllianceRole.Member));

    AllianceJoinRequest.deleteRecord(acceptedEntity, allianceEntity);
    AllianceMemberSet.add(allianceEntity, acceptedEntity);
  }
}
