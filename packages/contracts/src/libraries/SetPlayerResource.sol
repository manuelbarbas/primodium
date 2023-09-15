// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { Set_Player, Set_PlayerResource, Set_PlayerResourceData } from "codegen/Tables.sol";

library SetPlayerResource {
  function has(bytes32 player, EResource resource) internal view returns (bool) {
    return Set_PlayerResource.get(player, resource).quantity > 0;
  }

  function get(bytes32 player, EResource resource) internal view returns (uint32) {
    return Set_PlayerResource.get(player, resource).quantity;
  }

  function getIndex(bytes32 player, EResource resource) internal view returns (uint256) {
    return Set_PlayerResource.get(player, resource).index;
  }

  function set(
    bytes32 player,
    EResource resource,
    uint32 quantity
  ) internal {
    if (quantity == 0) remove(player, resource);
    uint32 oldQuantity = Set_PlayerResource.get(player, resource).quantity;
    if (oldQuantity == 0) {
      Set_Player.push(player, uint8(resource));
      Set_PlayerResource.set(player, resource, Set_Player.length(player) - 1, quantity);
    } else {
      Set_PlayerResource.setQuantity(player, resource, quantity);
    }
  }

  function remove(bytes32 player, EResource resource) internal {
    Set_PlayerResourceData memory data = Set_PlayerResource.get(player, resource);
    if (data.quantity == 0) return;
    if (Set_Player.length(player) == 1) {
      clear(player);
      return;
    }
    uint8 replacement = Set_Player.getItem(player, Set_Player.length(player) - 1);
    Set_Player.update(player, data.index, replacement);
    Set_Player.pop(player);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < Set_Player.length(player); i++) {
      Set_PlayerResource.deleteRecord(player, EResource(Set_Player.getItem(player, i)));
    }
    Set_Player.deleteRecord(player);
  }
}
