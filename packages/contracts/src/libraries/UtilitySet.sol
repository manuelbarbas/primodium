// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { Set_Utilities, Set_UtilityUsage, Set_UtilityUsageData } from "codegen/Tables.sol";

library UtilitySet {
  function has(bytes32 player, EResource resource) internal view returns (bool) {
    return Set_UtilityUsage.get(player, resource).quantity > 0;
  }

  function get(bytes32 player, EResource resource) internal view returns (uint32) {
    return Set_UtilityUsage.get(player, resource).quantity;
  }

  function add(bytes32 player, EResource resource) internal {
    if (has(player, resource)) return;
    Set_Utilities.push(player, uint8(resource));
  }

  function getAll(bytes32 player) internal view returns (uint8[] memory) {
    return Set_Utilities.get(player);
  }

  function getIndex(bytes32 player, EResource resource) internal view returns (uint256) {
    return Set_UtilityUsage.get(player, resource).index;
  }

  function set(
    bytes32 player,
    EResource resource,
    uint32 quantity
  ) internal {
    if (quantity == 0) remove(player, resource);
    uint32 oldQuantity = Set_UtilityUsage.get(player, resource).quantity;
    if (oldQuantity == 0) {
      Set_Utilities.push(player, uint8(resource));
      Set_UtilityUsage.set(player, resource, Set_Utilities.length(player) - 1, quantity);
    } else {
      Set_UtilityUsage.setQuantity(player, resource, quantity);
    }
  }

  function remove(bytes32 player, EResource resource) internal {
    Set_UtilityUsageData memory data = Set_UtilityUsage.get(player, resource);
    if (data.quantity == 0) return;
    if (Set_Utilities.length(player) == 1) {
      clear(player);
      return;
    }
    uint8 replacement = Set_Utilities.getItem(player, Set_Utilities.length(player) - 1);
    Set_Utilities.update(player, data.index, replacement);
    Set_Utilities.pop(player);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < Set_Utilities.length(player); i++) {
      Set_UtilityUsage.deleteRecord(player, EResource(Set_Utilities.getItem(player, i)));
    }
    Set_Utilities.deleteRecord(player);
  }
}
