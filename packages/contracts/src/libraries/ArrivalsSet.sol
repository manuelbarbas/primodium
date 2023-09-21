// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Arrival } from "src/Types.sol";
import { SetArrivals, SetItemArrivals1, SetItemArrivals1Data, SetItemArrivals2, SetItemArrivals2Data, SetItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsSet {
  /// @notice Encodes Arrival data into two parts
  /// @param item The Arrival item
  /// @return item1 Part 1 of Arrival, item2 Part 2 of Arrival
  function encodeArrivalData(Arrival memory item)
    private
    pure
    returns (SetItemArrivals1Data memory item1, SetItemArrivals2Data memory item2)
  {
    item1 = SetItemArrivals1Data({
      sendType: item.sendType,
      arrivalBlock: item.arrivalBlock,
      from: item.from,
      to: item.to
    });

    item2 = SetItemArrivals2Data({
      origin: item.origin,
      destination: item.destination,
      unitCounts: item.unitCounts,
      unitTypes: item.unitTypes
    });
  }

  /// @notice Decodes Arrival data from two parts
  /// @param item1 Part 1 of Arrival
  /// @param item2 Part 2 of Arrival
  /// @return The decoded Arrival item
  function decodeArrivalData(SetItemArrivals1Data memory item1, SetItemArrivals2Data memory item2)
    private
    pure
    returns (Arrival memory)
  {
    return
      Arrival({
        sendType: item1.sendType,
        arrivalBlock: item1.arrivalBlock,
        from: item1.from,
        to: item1.to,
        origin: item2.origin,
        destination: item2.destination,
        unitCounts: item2.unitCounts,
        unitTypes: item2.unitTypes
      });
  }

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
    (SetItemArrivals1Data memory item1, SetItemArrivals2Data memory item2) = encodeArrivalData(item);
    SetItemArrivals1.set(player, asteroid, key, item1);
    SetItemArrivals2.set(player, asteroid, key, item2);
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
  /// @return An array of Arrival items
  function getAll(bytes32 player, bytes32 asteroid) internal view returns (Arrival[] memory items) {
    bytes32[] memory keys = getAllKeys(player, asteroid);
    items = new Arrival[](keys.length);
    for (uint256 i = 0; i < keys.length; i++) {
      SetItemArrivals1Data memory item1 = SetItemArrivals1.get(player, asteroid, keys[i]);
      SetItemArrivals2Data memory item2 = SetItemArrivals2.get(player, asteroid, keys[i]);
      items[i] = decodeArrivalData(item1, item2);
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
    SetItemArrivals1.deleteRecord(player, asteroid, key);
    SetItemArrivals2.deleteRecord(player, asteroid, key);
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
      SetItemArrivals1.deleteRecord(player, asteroid, key);
      SetItemArrivals2.deleteRecord(player, asteroid, key);
      SetItemStoredArrivals.deleteRecord(player, asteroid, key);
    }
    SetArrivals.deleteRecord(player, asteroid);
  }
}
