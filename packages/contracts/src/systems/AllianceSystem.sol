// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

contract AllianceSystem is PrimodiumSystem {
  /**
   * @dev try to join an alliance
   * @param alliance the entity ID of the alliance.
   */
  function join(bytes32 alliance) public {}

  /**
   * @dev create an alliance
   */
  function create() public returns (bytes32 allianceEntity) {}

  /**
   * @dev leave an alliance
   */
  function leave() public {}

  /**
   * @dev invite a player to an alliance
   */
  function invite(bytes32 target) public {}

  /**
   * @dev revoke an invite to an alliance
   * @param target the entity id of the player to revoke the invite from
   */
  function revokeInvite(bytes32 target) public {}

  /**
   * @dev kick a player from an alliance
   * @param target the entity id of the player to kick
   */
  function kick(bytes32 target) public {}

  /**
   * @dev grant a role to a player within an alliance
   * @param target The entity ID of the player being granted the role.
   * @param role The role to grant.
   */
  function grantRole(bytes32 target, uint8 role) public {}

  /**
   * @dev grant a role to a player within an alliance
   * @param alliance The entity ID of the alliance the player has requested to join.
   */
  function requestToJoin(bytes32 alliance) public {}

  /**
   * @dev reject a player's request to join an alliance
   * @param rejectee The entity ID of the the player who has requested to join.
   */
  function rejectRequestToJoin(bytes32 rejectee) public {}
}
