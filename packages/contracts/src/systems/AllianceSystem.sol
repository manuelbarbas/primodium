// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibAlliance } from "libraries/LibAlliance.sol";
import { EAllianceInviteMode, EAllianceRole } from "src/Types.sol";
import { addressToEntity } from "src/utils.sol";

contract AllianceSystem is PrimodiumSystem {
  /**
   * @dev try to join an alliance
   * @param alliance the entity ID of the alliance.
   */
  function join(bytes32 alliance) public {
    LibAlliance.join(_player(), alliance);
  }

  /**
   * @dev create an alliance
   * @param name the name of the alliance
   * @param allianceInviteMode the invite mode of the alliance
   */
  function create(bytes32 name, EAllianceInviteMode allianceInviteMode) public returns (bytes32 allianceEntity) {
    return LibAlliance.create(_player(), name, allianceInviteMode);
  }

  /**
   * @dev leave an alliance
   */
  function leave() public {
    LibAlliance.leave(_player());
  }

  /**
   * @dev invite a player to an alliance
   * @param target the entity ID of the player to invite
   */
  function invite(address target) public {
    LibAlliance.invite(_player(), addressToEntity(target));
  }

  /**
   * @dev revoke an invite to an alliance
   * @param target the entity id of the player to revoke the invite from
   */
  function revokeInvite(address target) public {
    LibAlliance.revokeInvite(_player(), addressToEntity(target));
  }

  /**
   * @dev revoke an invite to an alliance
   * @param inviter the entity id of the player to revoke the invite from
   */
  function declineInvite(address inviter) public {
    LibAlliance.revokeInvite(addressToEntity(inviter), _player());
  }

  /**
   * @dev kick a player from an alliance
   * @param target the entity id of the player to kick
   */
  function kick(address target) public {
    LibAlliance.kick(_player(), addressToEntity(target));
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param target The entity ID of the player being granted the role.
   * @param role The role to grant.
   */
  function grantRole(address target, EAllianceRole role) public {
    LibAlliance.grantRole(_player(), addressToEntity(target), role);
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param alliance The entity ID of the alliance the player has requested to join.
   */
  function requestToJoin(bytes32 alliance) public {
    LibAlliance.requestToJoin(_player(), alliance);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param rejectee The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(address rejectee) public {
    LibAlliance.rejectRequestToJoin(_player(), addressToEntity(rejectee));
  }

  /**
   * @dev accept a player's request to join an alliance
   * @param accepted The entity ID of the the player who has requested to join.
   */
  function acceptRequestToJoin(address accepted) public {
    LibAlliance.acceptRequestToJoin(_player(), addressToEntity(accepted));
  }
}
