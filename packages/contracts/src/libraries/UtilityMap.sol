// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_UtilityMap, Value_UtilityMap, Meta_UtilityMap } from "codegen/index.sol";

/**
 * @title UtilityMap
 * @dev Library to manage a mapping of utilities (identified by uint8 keys) to values for each player entity in a game.
 */
library UtilityMap {
  /**
   * @notice Checks if a player has a specific utility.
   * @param playerEntity The identifier of the player.
   * @param utility The utility to check for.
   * @return True if the utility exists for the player, false otherwise.
   */
  function has(bytes32 playerEntity, uint8 utility) internal view returns (bool) {
    return Meta_UtilityMap.get(playerEntity, utility).stored;
  }

  /**
   * @notice Sets a utility item for a player.
   * @param playerEntity The identifier of the player.
   * @param utility The utility to set.
   * @param item The item value to associate with the utility.
   * @dev Adds the utility if it doesn't exist, otherwise updates the existing utility's value.
   */
  function set(bytes32 playerEntity, uint8 utility, uint256 item) internal {
    if (has(playerEntity, utility)) {
      Value_UtilityMap.set(playerEntity, utility, item);
    } else {
      Keys_UtilityMap.push(playerEntity, utility);
      Value_UtilityMap.set(playerEntity, utility, item);
      Meta_UtilityMap.set(playerEntity, utility, true, Keys_UtilityMap.length(playerEntity) - 1);
    }
  }

  /**
   * @notice Retrieves the value of a specific utility for a player.
   * @param playerEntity The identifier of the player.
   * @param utility The utility to retrieve the value for.
   * @return The value associated with the utility.
   */
  function get(bytes32 playerEntity, uint8 utility) internal view returns (uint256) {
    return Value_UtilityMap.get(playerEntity, utility);
  }

  /**
   * @notice Returns a list of utilities that the player has.
   * @param playerEntity The identifier of the player.
   * @return An array of utility identifiers.
   */
  function keys(bytes32 playerEntity) internal view returns (uint8[] memory) {
    return Keys_UtilityMap.get(playerEntity);
  }

  /**
   * @notice Returns the values associated with each utility the player has.
   * @param playerEntity The identifier of the player.
   * @return items An array of utility values.
   */
  function values(bytes32 playerEntity) internal view returns (uint256[] memory items) {
    uint8[] memory _utilities = keys(playerEntity);
    items = new uint256[](_utilities.length);
    for (uint256 i = 0; i < _utilities.length; i++) {
      items[i] = Value_UtilityMap.get(playerEntity, _utilities[i]);
    }
  }

  /**
   * @notice Removes a utility from a player.
   * @param playerEntity The identifier of the player.
   * @param utility The utility to remove.
   * @dev Maintains the integrity of the utility keys array by replacing the removed utility with the last in the array.
   */
  function remove(bytes32 playerEntity, uint8 utility) internal {
    uint256 index = Meta_UtilityMap.getIndex(playerEntity, utility);
    if (Keys_UtilityMap.length(playerEntity) == 1) {
      clear(playerEntity);
      return;
    }

    // update replacement data
    uint8 replacement = Keys_UtilityMap.getItem(playerEntity, Keys_UtilityMap.length(playerEntity) - 1);
    Keys_UtilityMap.update(playerEntity, index, replacement);
    Meta_UtilityMap.set(playerEntity, replacement, true, index);

    // remove utility
    Keys_UtilityMap.pop(playerEntity);
    Value_UtilityMap.deleteRecord(playerEntity, utility);
    Meta_UtilityMap.deleteRecord(playerEntity, utility);
  }

  /**
   * @notice Returns the number of utilities a player has.
   * @param playerEntity The identifier of the player.
   * @return The number of utilities.
   */
  function size(bytes32 playerEntity) internal view returns (uint256) {
    return Keys_UtilityMap.length(playerEntity);
  }

  /**
   * @notice Clears all utilities associated with a player.
   * @param playerEntity The identifier of the player.
   * @dev Iterates through all utilities and deletes them.
   */
  function clear(bytes32 playerEntity) internal {
    for (uint256 i = 0; i < Keys_UtilityMap.length(playerEntity); i++) {
      uint8 utility = Keys_UtilityMap.getItem(playerEntity, Keys_UtilityMap.length(playerEntity) - 1);
      Value_UtilityMap.deleteRecord(playerEntity, utility);
      Meta_UtilityMap.deleteRecord(playerEntity, utility);
    }
    Keys_UtilityMap.deleteRecord(playerEntity);
  }
}
