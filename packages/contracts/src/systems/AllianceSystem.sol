// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibAlliance } from "codegen/Libraries.sol";
import { EAllianceInviteMode } from "src/Types.sol";

contract AllianceSystem is PrimodiumSystem {
  /**
   * @dev try to join an alliance
   * @param alliance the entity ID of the alliance.
   */
  function join(bytes32 alliance) public {
    LibAlliance.join(addressToEntity(_msgSender()), alliance);
  }

  /**
   * @dev create an alliance
   */
  function create(bytes32 name, EAllianceInviteMode allianceInviteMode) public returns (bytes32 allianceEntity) {
    return LibAlliance.create(addressToEntity(_msgSender()), name, allianceInviteMode);
  }

  /**
   * @dev leave an alliance
   */
  function leave() public {
    LibAlliance.leave(addressToEntity(_msgSender()));
  }

  /**
   * @dev invite a player to an alliance
   */
  function invite(bytes32 target) public {
    LibAlliance.invite(addressToEntity(_msgSender()), target);
  }

  /**
   * @dev revoke an invite to an alliance
   * @param target the entity id of the player to revoke the invite from
   */
  function revokeInvite(bytes32 target) public {
    LibAlliance.revokeInvite(addressToEntity(_msgSender()), target);
  }

  /**
   * @dev kick a player from an alliance
   * @param target the entity id of the player to kick
   */
  function kick(bytes32 target) public {
    LibAlliance.kick(addressToEntity(_msgSender()), target);
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param target The entity ID of the player being granted the role.
   * @param role The role to grant.
   */
  function grantRole(bytes32 target, uint8 role) public {
    LibAlliance.grantRole(addressToEntity(_msgSender()), target, role);
  }

  /**
   * @dev grant a role to a player within an alliance
   * @param alliance The entity ID of the alliance the player has requested to join.
   */
  function requestToJoin(bytes32 alliance) public {
    LibAlliance.requestToJoin(addressToEntity(_msgSender()), alliance);
  }

  /**
   * @dev reject a player's request to join an alliance
   * @param rejectee The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(bytes32 rejectee) public {
    LibAlliance.rejectRequestToJoin(addressToEntity(_msgSender()), rejectee);
  }
}
