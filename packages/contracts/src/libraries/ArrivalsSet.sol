// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Arrival } from "src/Types.sol";
import { SetArrivals, SetItemArrivals, SetItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsSet {
  /// @notice Calculates the key for an Arrival item
  /// @param item The Arrival item
  /// @return The key of the Arrival item
  function getKey(Arrival memory item) private pure returns (bytes32) {
    return keccak256(abi.encode(item));
  }

  /// @notice Checks if an Arrival exists
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @param item The Arrival item
  /// @return true if exists, false otherwise
  function has(
    bytes32 player,
    bytes32 asteroid,
    Arrival memory item
  ) internal view returns (bool) {
    return SetItemStoredArrivals.get(player, asteroid, getKey(item)).stored;
  }

  /// @notice Adds a new Arrival
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @param item The Arrival item
  function add(
    bytes32 player,
    bytes32 asteroid,
    Arrival memory item
  ) internal {
    if (has(player, asteroid, item)) return;
    bytes32 key = getKey(item);
    SetArrivals.push(player, asteroid, key);
    SetItemArrivals.set(player, asteroid, key, abi.encode(item));
    SetItemStoredArrivals.set(player, asteroid, key, true, SetArrivals.length(player, asteroid) - 1);
  }

  /// @notice Gets all keys for Arrivals
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @return An array of keys
  function getAllKeys(bytes32 player, bytes32 asteroid) private view returns (bytes32[] memory) {
    return SetArrivals.get(player, asteroid);
  }

  /// @notice Gets all Arrival items
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @return items An array of Arrival items
  function getAll(bytes32 player, bytes32 asteroid) internal view returns (Arrival[] memory items) {
    bytes32[] memory keys = getAllKeys(player, asteroid);
    items = new Arrival[](keys.length);
    for (uint256 i = 0; i < keys.length; i++) {
      bytes memory encoding = SetItemArrivals.get(player, asteroid, keys[i]);
      items[i] = abi.decode(encoding, (Arrival));
    }
  }

  /// @notice Removes an Arrival item
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @param item The Arrival item
  function remove(
    bytes32 player,
    bytes32 asteroid,
    Arrival memory item
  ) internal {
    bytes32 key = getKey(item);
    uint256 index = SetItemStoredArrivals.getIndex(player, asteroid, key);
    if (SetArrivals.length(player, asteroid) == 1) {
      clear(player, asteroid);
      return;
    }
    bytes32 replacement = SetArrivals.getItem(player, asteroid, SetArrivals.length(player, asteroid) - 1);
    SetArrivals.update(player, asteroid, index, replacement);
    SetArrivals.pop(player, asteroid);
    SetItemArrivals.deleteRecord(player, asteroid, key);
    SetItemStoredArrivals.deleteRecord(player, asteroid, key);
  }

  /// @notice Gets the size of Arrivals
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  /// @return The number of stored Arrivals
  function size(bytes32 player, bytes32 asteroid) internal view returns (uint256) {
    return SetArrivals.length(player, asteroid);
  }

  /// @notice Clears all Arrivals
  /// @param player Player's address
  /// @param asteroid Asteroid's address
  function clear(bytes32 player, bytes32 asteroid) internal {
    for (uint256 i = 0; i < SetArrivals.length(player, asteroid); i++) {
      bytes32 key = SetArrivals.getItem(player, asteroid, SetArrivals.length(player, asteroid) - 1);
      SetItemArrivals.deleteRecord(player, asteroid, key);
      SetItemStoredArrivals.deleteRecord(player, asteroid, key);
    }
    SetArrivals.deleteRecord(player, asteroid);
  }
}
