// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SetArrivals, SetItemArrivals, SetItemArrivalsData, SetItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsSet {
  function getKey(SetItemArrivalsData memory item) internal pure returns (bytes32) {
    return keccak256(abi.encode(item));
  }

  function has(bytes32 player, SetItemArrivalsData memory item) internal view returns (bool) {
    return SetItemStoredArrivals.get(player, getKey(item)).stored;
  }

  function add(bytes32 player, SetItemArrivalsData memory item) internal {
    if (has(player, item)) return;
    bytes32 key = getKey(item);
    SetArrivals.push(player, key);
    SetItemArrivals.set(player, key, item);
    SetItemStoredArrivals.set(player, key, true, SetArrivals.length(player) - 1);
  }

  function getAllKeys(bytes32 player) internal view returns (bytes32[] memory) {
    return SetArrivals.get(player);
  }

  function getAllValues(bytes32 player) internal view returns (SetItemArrivalsData[] memory items) {
    bytes32[] memory keys = getAllKeys(player);
    items = new SetItemArrivalsData[](keys.length);
    for (uint256 i = 0; i < keys.length; i++) {
      items[i] = SetItemArrivals.get(player, keys[i]);
    }
  }

  function remove(bytes32 player, SetItemArrivalsData memory item) internal {
    bytes32 key = getKey(item);
    uint256 index = SetItemStoredArrivals.getIndex(player, key);
    if (SetArrivals.length(player) == 1) {
      clear(player);
      return;
    }
    bytes32 replacement = SetArrivals.getItem(player, SetArrivals.length(player) - 1);
    SetArrivals.update(player, index, replacement);
    SetArrivals.pop(player);
    SetItemArrivals.deleteRecord(player, key);
    SetItemStoredArrivals.deleteRecord(player, key);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetArrivals.length(player); i++) {
      bytes32 key = SetArrivals.getItem(player, SetArrivals.length(player) - 1);
      SetItemArrivals.deleteRecord(player, key);
      SetItemStoredArrivals.deleteRecord(player, key);
    }
    SetArrivals.deleteRecord(player);
  }
}
