// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Arrival } from "src/Types.sol";
import { MapArrivals, MapItemArrivals, MapItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsMap {
  /**
   * @dev Checks if an arrival is stored for a specific player, asteroid, and key.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @param key The unique key for the arrival.
   * @return true if the arrival exists, false otherwise.
   */
  function has(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal view returns (bool) {
    return MapItemStoredArrivals.get(player, asteroid, key).stored;
  }

  /**
   * @dev Sets an arrival for a specific player, asteroid, and key.
   * If the arrival already exists, it updates the existing one.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @param key The unique key for the arrival.
   * @param item The arrival data to store.
   */
  function set(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key,
    Arrival memory item
  ) internal {
    if (has(player, asteroid, key)) {
      MapItemArrivals.set(player, asteroid, key, abi.encode(item));
    } else {
      MapArrivals.push(player, asteroid, key);
      MapItemArrivals.set(player, asteroid, key, abi.encode(item));
      MapItemStoredArrivals.set(player, asteroid, key, true, MapArrivals.length(player, asteroid) - 1);
    }
  }

  /**
   * @dev Gets an arrival for a specific player, asteroid, and key.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @param key The unique key for the arrival.
   * @return The stored arrival data.
   */
  function get(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal view returns (Arrival memory) {
    bytes memory encoding = MapItemArrivals.get(player, asteroid, key);
    return abi.decode(encoding, (Arrival));
  }

  /**
   * @dev Retrieves all keys associated with arrivals for a specific player and asteroid.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @return An array of keys for the arrivals.
   */
  function keys(bytes32 player, bytes32 asteroid) internal view returns (bytes32[] memory) {
    return MapArrivals.get(player, asteroid);
  }

  /**
   * @dev Retrieves all arrival data associated with a specific player and asteroid.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @return An array of arrival data.
   */
  function values(bytes32 player, bytes32 asteroid) internal view returns (Arrival[] memory items) {
    bytes32[] memory _keys = keys(player, asteroid);
    items = new Arrival[](_keys.length);
    for (uint256 i = 0; i < _keys.length; i++) {
      bytes memory encoding = MapItemArrivals.get(player, asteroid, _keys[i]);
      items[i] = abi.decode(encoding, (Arrival));
    }
  }

  /**
   * @dev Removes an arrival for a specific player, asteroid, and key.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @param key The unique key for the arrival to remove.
   */
  function remove(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal {
    uint256 index = MapItemStoredArrivals.getIndex(player, asteroid, key);
    if (MapArrivals.length(player, asteroid) == 1) {
      clear(player, asteroid);
      return;
    }
    bytes32 replacement = MapArrivals.getItem(player, asteroid, MapArrivals.length(player, asteroid) - 1);
    MapArrivals.update(player, asteroid, index, replacement);
    MapArrivals.pop(player, asteroid);
    MapItemArrivals.deleteRecord(player, asteroid, key);
    MapItemStoredArrivals.deleteRecord(player, asteroid, key);
  }

  /**
   * @dev Retrieves the number of arrivals stored for a specific player and asteroid.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   * @return The number of arrivals.
   */
  function size(bytes32 player, bytes32 asteroid) internal view returns (uint256) {
    return MapArrivals.length(player, asteroid);
  }

  /**
   * @dev Clears all arrivals for a specific player and asteroid.
   * @param player The player's identifier.
   * @param asteroid The asteroid's identifier.
   */
  function clear(bytes32 player, bytes32 asteroid) internal {
    for (uint256 i = 0; i < MapArrivals.length(player, asteroid); i++) {
      bytes32 key = MapArrivals.getItem(player, asteroid, MapArrivals.length(player, asteroid) - 1);
      MapItemArrivals.deleteRecord(player, asteroid, key);
      MapItemStoredArrivals.deleteRecord(player, asteroid, key);
    }
    MapArrivals.deleteRecord(player, asteroid);
  }
}
