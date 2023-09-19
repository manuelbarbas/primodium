// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { Motherlode, MotherlodeData, SetItemMotherlodes, SetMotherlodes } from "codegen/Tables.sol";

library MotherlodeSet {
  function has(bytes32 player, bytes32 motherlode) internal view returns (bool) {
    return Motherlode.get(motherlode).ownedBy == player;
  }

  function get(bytes32 motherlode) internal view returns (MotherlodeData memory) {
    return Motherlode.get(motherlode);
  }

  function add(bytes32 player, bytes32 motherlode) internal {
    if (has(player, motherlode)) return;
    SetMotherlodes.push(player, motherlode);
    bytes32 prevOwner = Motherlode.getOwnedBy(motherlode);
    if (prevOwner != 0) {
      remove(prevOwner, motherlode);
    }
    Motherlode.setOwnedBy(motherlode, player);
    SetItemMotherlodes.set(motherlode, SetMotherlodes.length(player) - 1);
  }

  function getAll(bytes32 player) internal view returns (bytes32[] memory) {
    return SetMotherlodes.get(player);
  }

  function set(bytes32 motherlode, MotherlodeData memory data) internal {
    Motherlode.set(motherlode, data);
  }

  function remove(bytes32 player, bytes32 motherlode) internal {
    if (!has(player, motherlode)) return;
    if (SetMotherlodes.length(player) == 1) {
      clear(player);
      return;
    }
    bytes32 replacementId = SetMotherlodes.getItem(player, SetMotherlodes.length(player) - 1);
    uint256 index = SetItemMotherlodes.get(motherlode);

    SetMotherlodes.update(player, index, replacementId);
    SetItemMotherlodes.set(replacementId, index);
    SetMotherlodes.pop(player);

    Motherlode.setOwnedBy(motherlode, 0);
    SetItemMotherlodes.set(motherlode, 0);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetMotherlodes.length(player); i++) {
      bytes32 motherlode = SetMotherlodes.getItem(player, i);
      Motherlode.setOwnedBy(motherlode, 0);
      SetItemMotherlodes.set(motherlode, 0);
    }
    SetMotherlodes.deleteRecord(player);
  }
}
