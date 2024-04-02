// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_AllianceMemberSet, Meta_AllianceMemberSet } from "codegen/index.sol";

/**
 * @title AllianceMemberSet
 * @dev Library for managing a set of alliance members. Provides functionality to add, remove, and clear members from an alliance.
 */
library AllianceMemberSet {
  /**
   * @notice Adds a new member to the specified alliance. Requires that the member is not already part of the alliance.
   * @dev Utilizes Meta_AllianceMemberSet to store member index and Keys_AllianceMemberSet to store members.
   * @param alliance The identifier of the alliance.
   * @param member The identifier of the member to be added.
   */
  function add(bytes32 alliance, bytes32 member) internal {
    require(!Meta_AllianceMemberSet.getStored(alliance, member), "[Alliance]: member already in Alliance");
    Meta_AllianceMemberSet.set(alliance, member, true, Keys_AllianceMemberSet.length(alliance));
    Keys_AllianceMemberSet.push(alliance, member);
  }

  /**
   * @notice Clears all members from the specified alliance.
   * @dev Iterates over all members of an alliance and removes their records from Meta_AllianceMemberSet and Keys_AllianceMemberSet.
   * @param alliance The identifier of the alliance to be cleared.
   */
  function clear(bytes32 alliance) internal {
    bytes32[] memory members = Keys_AllianceMemberSet.get(alliance);
    for (uint256 i = 0; i < members.length; i++) {
      Meta_AllianceMemberSet.deleteRecord(alliance, members[i]);
    }
    Keys_AllianceMemberSet.deleteRecord(alliance);
  }

  /**
   * @notice Removes a specified member from an alliance. Requires that the member is part of the alliance.
   * @dev Updates the member index and removes the member from Meta_AllianceMemberSet and Keys_AllianceMemberSet.
   * @param alliance The identifier of the alliance.
   * @param member The identifier of the member to be removed.
   */
  function remove(bytes32 alliance, bytes32 member) internal {
    require(Meta_AllianceMemberSet.getStored(alliance, member), "[Alliance]: member not part of Alliance");
    uint256 index = Meta_AllianceMemberSet.getIndex(alliance, member);

    if (index == Keys_AllianceMemberSet.length(alliance) - 1) {
      Keys_AllianceMemberSet.pop(alliance);
      Meta_AllianceMemberSet.deleteRecord(alliance, member);
      return;
    }

    Meta_AllianceMemberSet.deleteRecord(alliance, member);
    bytes32 lastMember = Keys_AllianceMemberSet.getItem(alliance, Keys_AllianceMemberSet.length(alliance) - 1);
    Keys_AllianceMemberSet.pop(alliance);
    Keys_AllianceMemberSet.update(alliance, index, lastMember);
    Meta_AllianceMemberSet.set(alliance, lastMember, true, index);
  }

  /**
   * @notice Retrieves the members of a specified alliance.
   * @dev Returns an array of member identifiers.
   * @param alliance The identifier of the alliance.
   * @return A bytes32 array containing the members of the alliance.
   */
  function getMembers(bytes32 alliance) internal view returns (bytes32[] memory) {
    return Keys_AllianceMemberSet.get(alliance);
  }

  /**
   * @notice Returns the number of members in a specified alliance.
   * @dev Utilizes Keys_AllianceMemberSet to get the length.
   * @param alliance The identifier of the alliance.
   * @return The number of members in the alliance.
   */
  function length(bytes32 alliance) internal view returns (uint256) {
    return Keys_AllianceMemberSet.length(alliance);
  }
}
