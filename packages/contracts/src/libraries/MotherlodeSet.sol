// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { SetMotherlodes, SetItemMotherlodes } from "codegen/Tables.sol";

library MotherlodeSet {
  function has(bytes32 player, bytes32 item) internal view returns (bool) {
    return SetItemMotherlodes.get(player, item).stored;
  }

  function add(bytes32 player, bytes32 item) internal {
    if (has(player, item)) return;
    SetMotherlodes.push(player, item);
    SetItemMotherlodes.set(player, item, true, SetMotherlodes.length(player) - 1);
  }

  function getAll(bytes32 player) internal view returns (bytes32[] memory) {
    return SetMotherlodes.get(player);
  }

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

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetMotherlodes.length(player); i++) {
      bytes32 item = SetMotherlodes.getItem(player, i);
      SetItemMotherlodes.deleteRecord(player, item);
    }
    SetMotherlodes.deleteRecord(player);
  }
}
