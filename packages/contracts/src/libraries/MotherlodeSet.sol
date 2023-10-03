// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SetMotherlodes, SetItemMotherlodes } from "codegen/index.sol";

library MotherlodeSet {
  /// @notice Check if a player has an item in Motherlodes set
  /// @param player Player's entity ID
  /// @param item Item's entity ID
  /// @return True if player has item, false otherwise
  function has(bytes32 player, bytes32 item) internal view returns (bool) {
    return SetItemMotherlodes.get(player, item).stored;
  }

  /// @notice Add item to a player's Motherlodes set
  /// @param player Player's entity ID
  /// @param item Item's entity ID
  function add(bytes32 player, bytes32 item) internal {
    if (has(player, item)) return;
    SetMotherlodes.push(player, item);
    SetItemMotherlodes.set(player, item, true, SetMotherlodes.length(player) - 1);
  }

  /// @notice Get all items in a player's Motherlodes set
  /// @param player Player's entity ID
  /// @return Array of item entity IDs
  function getAll(bytes32 player) internal view returns (bytes32[] memory) {
    return SetMotherlodes.get(player);
  }

  /// @notice Remove item from a player's Motherlodes set
  /// @param player Player's entity ID
  /// @param item Item's entity ID
  function remove(bytes32 player, bytes32 item) internal {
    if (!has(player, item)) return;
    if (SetMotherlodes.length(player) == 1) {
      clear(player);
      return;
    }

    bytes32 replacementId = SetMotherlodes.getItem(player, SetMotherlodes.length(player) - 1);
    uint256 index = SetItemMotherlodes.get(player, item).index;

    SetMotherlodes.update(player, index, replacementId);
    SetItemMotherlodes.setIndex(player, replacementId, index);
    SetMotherlodes.pop(player);
    SetItemMotherlodes.deleteRecord(player, item);
  }

  /// @notice Clear all items from a player's Motherlodes set
  /// @param player Player's entity ID
  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetMotherlodes.length(player); i++) {
      bytes32 item = SetMotherlodes.getItem(player, i);
      SetItemMotherlodes.deleteRecord(player, item);
    }
    SetMotherlodes.deleteRecord(player);
  }
}
