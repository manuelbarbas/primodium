// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { Motherlode, MotherlodeData, Set_EntityMotherlode, Set_Motherlodes } from "codegen/Tables.sol";

library MotherlodeSet {
  function has(bytes32 player, bytes32 motherlode) internal view returns (bool) {
    return Motherlode.get(motherlode).ownedBy == player;
  }

  function get(bytes32 motherlode) internal view returns (MotherlodeData memory) {
    return Motherlode.get(motherlode);
  }

  function add(bytes32 player, bytes32 motherlode) internal {
    if (has(player, motherlode)) return;
    Set_Motherlodes.push(player, motherlode);
    bytes32 prevOwner = Motherlode.getOwnedBy(motherlode);
    if (prevOwner != 0) {
      remove(prevOwner, motherlode);
    }
    Motherlode.setOwnedBy(motherlode, player);
    Set_EntityMotherlode.set(motherlode, Set_Motherlodes.length(player) - 1);
  }

  function getAll(bytes32 player) internal view returns (bytes32[] memory) {
    return Set_Motherlodes.get(player);
  }

  function set(bytes32 motherlode, MotherlodeData memory data) internal {
    Motherlode.set(motherlode, data);
  }

  function remove(bytes32 player, bytes32 motherlode) internal {
    if (!has(player, motherlode)) return;
    if (Set_Motherlodes.length(player) == 1) {
      clear(player);
      return;
    }
    bytes32 replacementId = Set_Motherlodes.getItem(player, Set_Motherlodes.length(player) - 1);
    uint256 index = Set_EntityMotherlode.get(motherlode);

    Set_Motherlodes.update(player, index, replacementId);
    Set_EntityMotherlode.set(replacementId, index);
    Set_Motherlodes.pop(player);

    Motherlode.setOwnedBy(motherlode, 0);
    Set_EntityMotherlode.set(motherlode, 0);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < Set_Motherlodes.length(player); i++) {
      bytes32 motherlode = Set_Motherlodes.getItem(player, i);
      Motherlode.setOwnedBy(motherlode, 0);
      Set_EntityMotherlode.set(motherlode, 0);
    }
    Set_Motherlodes.deleteRecord(player);
  }
}
