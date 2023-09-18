// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { Set_Utilities, Set_UtilityUsage, Set_UtilityUsageData } from "codegen/Tables.sol";

/// @title UtilitySet
/// @notice Library for managing utility-related data structures.
library UtilitySet {
  /// @notice Check if the player has a particular resource.
  /// @param player The address of the player.
  /// @param resource The resource to check.
  /// @return True if the player has the resource, otherwise false.
  function has(bytes32 player, EResource resource) internal view returns (bool) {
    return Set_UtilityUsage.get(player, resource).quantity > 0;
  }

  /// @notice Get the quantity of a resource for a player.
  /// @param player The address of the player.
  /// @param resource The resource to get.
  /// @return The quantity of the resource.
  function get(bytes32 player, EResource resource) internal view returns (uint256) {
    return Set_UtilityUsage.get(player, resource).quantity;
  }

  /// @notice Add a new resource to the utility set of a player.
  /// @param player The address of the player.
  /// @param resource The resource to add.
  function add(bytes32 player, EResource resource) internal {
    if (has(player, resource)) return;
    Set_Utilities.push(player, uint8(resource));
    Set_UtilityUsage.setIndex(player, resource, Set_Utilities.length(player) - 1);
  }

  /// @notice Get all resources for a player.
  /// @param player The address of the player.
  /// @return An array of all resources.
  function getAll(bytes32 player) internal view returns (uint8[] memory) {
    return Set_Utilities.get(player);
  }

  /// @notice Get the index of a resource for a player.
  /// @param player The address of the player.
  /// @param resource The resource to find the index of.
  /// @return The index of the resource.
  function getIndex(bytes32 player, EResource resource) internal view returns (uint256) {
    return Set_UtilityUsage.get(player, resource).index;
  }

  /// @notice Set the quantity of a resource for a player.
  /// @param player The address of the player.
  /// @param resource The resource to set.
  /// @param quantity The quantity to set.
  function set(
    bytes32 player,
    EResource resource,
    uint256 quantity
  ) internal {
    if (quantity == 0) remove(player, resource);
    uint256 oldQuantity = Set_UtilityUsage.get(player, resource).quantity;
    if (oldQuantity == 0) {
      Set_Utilities.push(player, uint8(resource));
      Set_UtilityUsage.set(player, resource, Set_Utilities.length(player) - 1, quantity);
    } else {
      Set_UtilityUsage.setQuantity(player, resource, quantity);
    }
  }

  /// @notice Remove a resource from a player's utility set.
  /// @param player The address of the player.
  /// @param resource The resource to remove.
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

  /// @notice Clear all resources for a player.
  /// @param player The address of the player.
  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < Set_Utilities.length(player); i++) {
      Set_UtilityUsage.deleteRecord(player, EResource(Set_Utilities.getItem(player, i)));
    }
    Set_Utilities.deleteRecord(player);
  }
}
