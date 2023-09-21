// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SetArrivals, SetItemArrivals, SetItemArrivalsData, SetItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsSet {
  function getKey(SetItemArrivalsData memory item) internal pure returns (bytes32) {
    return keccak256(abi.encode(item));
  }

  function has(
    bytes32 player,
    bytes32 asteroid,
    SetItemArrivalsData memory item
  ) internal view returns (bool) {
    return SetItemStoredArrivals.get(player, asteroid, getKey(item)).stored;
  }

  function add(
    bytes32 player,
    bytes32 asteroid,
    SetItemArrivalsData memory item
  ) internal {
    if (has(player, asteroid, item)) return;
    bytes32 key = getKey(item);
    SetArrivals.push(player, asteroid, key);
    SetItemArrivals.set(player, asteroid, key, item);
    SetItemStoredArrivals.set(player, asteroid, key, true, SetArrivals.length(player, asteroid) - 1);
  }

  function getAllKeys(bytes32 player, bytes32 asteroid) internal view returns (bytes32[] memory) {
    return SetArrivals.get(player, asteroid);
  }

  function getAllValues(bytes32 player, bytes32 asteroid) internal view returns (SetItemArrivalsData[] memory items) {
    bytes32[] memory keys = getAllKeys(player, asteroid);
    items = new SetItemArrivalsData[](keys.length);
    for (uint256 i = 0; i < keys.length; i++) {
      items[i] = SetItemArrivals.get(player, asteroid, keys[i]);
    }
  }

  function remove(
    bytes32 player,
    bytes32 asteroid,
    SetItemArrivalsData memory item
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

  function clear(bytes32 player, bytes32 asteroid) internal {
    for (uint256 i = 0; i < SetArrivals.length(player, asteroid); i++) {
      bytes32 key = SetArrivals.getItem(player, asteroid, SetArrivals.length(player, asteroid) - 1);
      SetItemArrivals.deleteRecord(player, asteroid, key);
      SetItemStoredArrivals.deleteRecord(player, asteroid, key);
    }
    SetArrivals.deleteRecord(player, asteroid);
  }
}
