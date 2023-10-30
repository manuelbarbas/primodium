// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
// tables
import { AllianceMembers, Score, AllianceJoinRequest, PlayerAlliance, Alliance, AllianceData, AllianceInvitation, HasBuiltBuilding, P_UnitProdTypes, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey, AllianceKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource, EAllianceRole, EAllianceInviteMode } from "src/Types.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

library LibAlliance {
  /**
   * @dev Checks for a player not to be part of an alliance.
   * @param playerEntity The entity ID of the player.
   */
  function checkNotMemberOfAnyAlliance(bytes32 playerEntity) internal view {
    require(PlayerAlliance.getAlliance(playerEntity) == 0, "[Alliance] Player is already part of an alliance");
  }

  /**
   * @dev Checks if a player is part of an alliance.
   * @param playerEntity The entity ID of the player.
   * @param allianceEntity The entity ID of the alliance.
   */
  function checkPlayerPartOfAlliance(bytes32 playerEntity, bytes32 allianceEntity) internal view {
    require(
      PlayerAlliance.getAlliance(playerEntity) == allianceEntity,
      "[Alliance] Player is not part of the alliance"
    );
  }

  /**
   * @dev Checks if a new player can join an alliance.
   * @param playerEntity The entity ID of the player.
   * @param allianceEntity The entity ID of the alliance.
   */
  function checkCanNewPlayerJoinAlliance(bytes32 playerEntity, bytes32 allianceEntity) internal view {
    bytes32 inviter = AllianceInvitation.get(playerEntity, allianceEntity);
    require(
      Alliance.getInviteMode(allianceEntity) == uint8(EAllianceInviteMode.Open) || inviter != 0,
      "[Alliance] Either alliance is not open or player has not been invited"
    );
    return;
  }

  /**
   * @dev Checks if the player can grant a role to another player.
   * @param playerEntity The entity ID of the player granting the role.
   */
  function checkCanGrantRole(
    bytes32 playerEntity,
    bytes32 toBeGranted,
    EAllianceRole roleToBeGranted
  ) internal view {
    require(playerEntity != toBeGranted, "[Alliance] Can not grant role to self");
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role <= uint8(roleToBeGranted), "[Alliance] Can not grant role higher then your own");
    require(role > 0 && role <= uint8(EAllianceRole.CanGrantRole), "[Alliance] Does not have permission to grant role");
    require(role < PlayerAlliance.getRole(toBeGranted), "[Alliance] Can not change role of superior");
  }

  /**
   * @dev Checks if the player can kick another player from the alliance.
   * @param playerEntity The entity ID of the player.
   */
  function checkCanKick(bytes32 playerEntity, bytes32 toBeKicked) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanKick), "[Alliance] Player does not have permission to kick");
    require(role < PlayerAlliance.getRole(toBeKicked), "[Alliance] Can not kick superior");
  }

  function checkCanReject(bytes32 playerEntity) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanKick), "[Alliance] Does not have permission to reject");
  }

  /**
   * @dev Checks if the player can invite another player to the alliance or accept a join request.
   * @param playerEntity The entity ID of the player.
   */
  function checkCanInviteOrAcceptJoinRequest(bytes32 playerEntity) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(
      role > 0 && role <= uint8(EAllianceRole.CanInvite),
      "[Alliance] Does not have permission to invite players"
    );
  }

  /**
   * @dev Checks if the player can revoke the invite to another player or reject a join request.
   * @param playerEntity The entity ID of the player.
   */
  function checkCanRevokeInvite(bytes32 playerEntity, bytes32 invitee) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(
      (role > 0 && role <= uint8(EAllianceRole.CanKick)) ||
        AllianceInvitation.get(invitee, PlayerAlliance.getAlliance(playerEntity)) == playerEntity,
      "[Alliance] Does not have permission to revoke invite"
    );
  }

  function checkCanCreateAlliance(bytes32 playerEntity) internal view {
    require(PlayerAlliance.getAlliance(playerEntity) == 0, "[Alliance] Player is already part of an alliance");
  }

  function checkCanLeaveAlliance(bytes32 playerEntity) internal view {
    require(PlayerAlliance.getRole(playerEntity) != EAllianceRole.Owner, "[Alliance] Owner can not leave");
  }

  /**
   * @dev try to join an alliance
   * @param player The entity ID of the player.
   * @param allianceEntity the entity ID of the alliance.
   */
  function join(bytes32 player, bytes32 allianceEntity) internal {
    checkNotMemberOfAnyAlliance(player);
    checkCanNewPlayerJoinAlliance(player, allianceEntity);

    PlayerAlliance.set(player, allianceEntity, uint8(EAllianceRole.Member));
    AllianceInvitation.set(player, allianceEntity, 0);
    uint256 playerScore = Score.get(player);
    Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) + playerScore);
  }

  /**
   * @dev create an alliance
   * @param player The entity ID of the player.
   */
  function create(
    bytes32 player,
    bytes32 name,
    EAllianceInviteMode allianceInviteMode
  ) internal returns (bytes32 allianceEntity) {
    checkNotMemberOfAnyAlliance(player);

    allianceEntity = LibEncode.getHash(AllianceKey, player);
    PlayerAlliance.set(player, allianceEntity, uint8(EAllianceRole.Owner));
    Alliance.set(allianceEntity, AllianceData(name, 0, uint8(allianceInviteMode)));
    uint256 playerScore = Score.get(player);
    Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) + playerScore);
    Score.set(allianceEntity, Score.get(allianceEntity) + playerScore);
  }

  /**
   * @dev leave an alliance
   * @param player The entity ID of the player.
   */
  function leave(bytes32 player) internal {
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    if (allianceEntity == 0) return;
    PlayerAlliance.set(player, 0, uint8(EAllianceRole.NULL));
    uint256 playerScore = Score.get(player);
    Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) - playerScore);

    if (AllianceMembers.length(allianceEntity) > 1) {
      bytes32 replacement = AllianceMembers.getMember(allianceEntity, AllianceMembers.length(allianceEntity) - 1);
      MapArrivals.update(allianceEntity, index, replacement);
    }
    MapArrivals.pop(allianceEntity);
  }

  /**
   * @dev invite a player to an alliance
   * @param player The entity ID of the player.
   */
  function invite(bytes32 player, bytes32 target) internal {
    checkCanInviteOrAcceptJoinRequest(player);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    AllianceInvitation.set(target, allianceEntity, player);
  }

  /**
   * @dev revoke an invite to an alliance
   * @param player The entity ID of the player revoking the invite.
   * @param target the entity id of the player to revoke the invite from
   */
  function revokeInvite(bytes32 player, bytes32 target) internal {
    checkCanRevokeInvite(player, target);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    AllianceInvitation.set(target, allianceEntity, 0);
  }

  /**
   * @dev kick a player from an alliance
   * @param player The entity ID of the player kicking.
   * @param target the entity id of the player to kick
   */
  function kick(bytes32 player, bytes32 target) internal {
    checkCanKick(player, target);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    PlayerAlliance.set(target, 0, uint8(EAllianceRole.NULL));
    uint256 playerScore = Score.get(target);
    Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) - playerScore);
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param granter The entity ID of the player granting the role.
   * @param target The entity ID of the player being granted the role.
   * @param role The role to grant.
   */
  function grantRole(
    bytes32 granter,
    bytes32 target,
    EAllianceRole role
  ) internal {
    checkCanGrantRole(granter, target, role);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(granter);
    PlayerAlliance.set(target, allianceEntity, uint8(role));

    //if the role being granted is Owner, then the granter loses that role and becomes CanGrantRole
    if (role == EAllianceRole.Owner) {
      PlayerAlliance.set(granter, allianceEntity, uint8(EAllianceRole.CanGrantRole));
    }
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param player The entity ID of the player who is requesting to join.
   * @param alliance The entity ID of the alliance the player has requested to join.
   */
  function requestToJoin(bytes32 player, bytes32 alliance) internal {
    AllianceJoinRequest.set(player, alliance, true);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param player The entity ID of the player who is rejecting the request to join.
   * @param rejectee The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(bytes32 player, bytes32 rejectee) internal {
    checkCanReject(player);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    AllianceJoinRequest.set(rejectee, allianceEntity, false);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param player The entity ID of the player who is accepting the request to join.
   * @param accepted The entity ID of the the player who has requested to join.
   */
  function acceptRequestToJoin(bytes32 player, bytes32 accepted) internal {
    checkCanInviteOrAcceptJoinRequest(player);

    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);

    PlayerAlliance.set(accepted, allianceEntity, uint8(EAllianceRole.Member));

    uint256 playerScore = Score.get(accepted);
    Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) + playerScore);

    AllianceJoinRequest.set(accepted, allianceEntity, false);
  }
}
