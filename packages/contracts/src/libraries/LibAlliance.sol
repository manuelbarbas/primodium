// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
// tables
import { Score, AllianceJoinRequest, PlayerAlliance, Alliance, AllianceData, AllianceInvitation, HasBuiltBuilding, P_UnitProdTypes, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

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
   * @dev Checks if a new player can join an alliance.
   * @param alliance The entity ID of the alliance.
   */
  function checkPlayerPartOfAlliance(bytes32 playerEntity, bytes32 alliance) internal view {
    require(PlayerAlliance.getAlliance(playerEntity) == alliance, "[Alliance] : player is not part of alliance");
  }

  /**
   * @dev Checks if a new player can join an alliance.
   * @param alliance The entity ID of the alliance.
   */
  function checkCanNewPlayerJoinAlliance(bytes32 alliance) internal view {
    // we can cap number of players in an alliance
    return;
  }

  /**
   * @dev Checks if the player can grant a role to another player.
   * @param playerEntity The entity ID of the player granting the role.
   */
  function checkCanGrantRole(bytes32 playerEntity) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(
      role > 0 && role <= uint8(EAllianceRole.CanGrantRole),
      "[Alliance] : does not have permission to grant role"
    );
  }

  /**
   * @dev Checks if the player can kick another player from the alliance.
   * @param playerEntity The entity ID of the player.
   */
  function checkCanKick(bytes32 playerEntity) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanKick), "[Alliance] : does not have permission to grant role");
  }

  /**
   * @dev Checks if the player can invite another player to the alliance or accept a join request.
   * @param playerEntity The entity ID of the player.
   */
  function checkCanInviteOrAcceptJoinRequest(bytes32 playerEntity) internal view {
    uint8 role = PlayerAlliance.getRole(playerEntity);
    require(role > 0 && role <= uint8(EAllianceRole.CanInvite), "[Alliance] : does not have permission to grant role");
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
      "[Alliance] : does not have permission to revoke invite"
    );
  }

  /**
   * @dev try to join an alliance
   * @param player The entity ID of the player.
   * @param allianceEntity the entity ID of the alliance.
   */
  function join(bytes32 player, bytes32 allianceEntity) internal {
    checkCanNewPlayerJoinAlliance(allianceEntity);

    if (
      Alliance.getInviteMode(allianceEntity) == uint8(EAllianceInviteMode.Open) ||
      AllianceInvitation.get(player, allianceEntity) != 0
    ) {
      PlayerAlliance.set(player, allianceEntity, uint8(EAllianceRole.Member));
      AllianceInvitation.set(player, allianceEntity, 0);
      uint256 playerScore = Score.get(player);
      Alliance.setScore(allianceEntity, Alliance.getScore(allianceEntity) + playerScore);
    }
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
    checkCanKick(player);
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
    uint8 role
  ) internal {
    checkCanGrantRole(granter);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(granter);
    PlayerAlliance.set(target, allianceEntity, role);
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
   * @param player The entity ID of the player who is requesting to join.
   * @param rejectee The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(bytes32 player, bytes32 rejectee) internal {
    checkCanKick(player);
    bytes32 allianceEntity = PlayerAlliance.getAlliance(player);
    AllianceJoinRequest.set(rejectee, allianceEntity, false);
  }
}
