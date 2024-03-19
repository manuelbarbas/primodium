// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { SetAllianceMembers, SetIndexForAllianceMembers } from "codegen/index.sol";

/**
 * @title AllianceMembersSet
 * @dev Library for managing a set of alliance members. Provides functionality to add, remove, and clear members from an alliance.
 */
library AllianceMembersSet {
  /**
   * @notice Adds a new member to the specified alliance. Requires that the member is not already part of the alliance.
   * @dev Utilizes SetIndexForAllianceMembers to store member index and SetAllianceMembers to store members.
   * @param alliance The identifier of the alliance.
   * @param member The identifier of the member to be added.
   */
  function add(bytes32 alliance, bytes32 member) internal {
    require(!SetIndexForAllianceMembers.getStored(alliance, member), "[Alliance]: member already in Alliance");
    SetIndexForAllianceMembers.set(alliance, member, true, SetAllianceMembers.length(alliance));
    SetAllianceMembers.push(alliance, member);
  }

  /**
   * @notice Clears all members from the specified alliance.
   * @dev Iterates over all members of an alliance and removes their records from SetIndexForAllianceMembers and SetAllianceMembers.
   * @param alliance The identifier of the alliance to be cleared.
   */
  function clear(bytes32 alliance) internal {
    bytes32[] memory members = SetAllianceMembers.get(alliance);
    for (uint256 i = 0; i < members.length; i++) {
      SetIndexForAllianceMembers.deleteRecord(alliance, members[i]);
    }
    SetAllianceMembers.deleteRecord(alliance);
  }

  /**
   * @notice Removes a specified member from an alliance. Requires that the member is part of the alliance.
   * @dev Updates the member index and removes the member from SetIndexForAllianceMembers and SetAllianceMembers.
   * @param alliance The identifier of the alliance.
   * @param member The identifier of the member to be removed.
   */
  function remove(bytes32 alliance, bytes32 member) internal {
    require(SetIndexForAllianceMembers.getStored(alliance, member), "[Alliance]: member not part of Alliance");
    uint256 index = SetIndexForAllianceMembers.getIndex(alliance, member);

    if (index == SetAllianceMembers.length(alliance) - 1) {
      SetAllianceMembers.pop(alliance);
      SetIndexForAllianceMembers.deleteRecord(alliance, member);
      return;
    }

    SetIndexForAllianceMembers.deleteRecord(alliance, member);
    bytes32 lastMember = SetAllianceMembers.getItem(alliance, SetAllianceMembers.length(alliance) - 1);
    SetAllianceMembers.pop(alliance);
    SetAllianceMembers.update(alliance, index, lastMember);
    SetIndexForAllianceMembers.set(alliance, lastMember, true, index);
  }

  /**
   * @notice Retrieves the members of a specified alliance.
   * @dev Returns an array of member identifiers.
   * @param alliance The identifier of the alliance.
   * @return A bytes32 array containing the members of the alliance.
   */
  function getMembers(bytes32 alliance) internal view returns (bytes32[] memory) {
    return SetAllianceMembers.get(alliance);
  }

  /**
   * @notice Returns the number of members in a specified alliance.
   * @dev Utilizes SetAllianceMembers to get the length.
   * @param alliance The identifier of the alliance.
   * @return The number of members in the alliance.
   */
  function length(bytes32 alliance) internal view returns (uint256) {
    return SetAllianceMembers.length(alliance);
  }
}
