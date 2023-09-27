// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { SetUtilities, SetItemUtilities, SetItemUtilitiesData } from "codegen/index.sol";

/// @title UtilitySet
/// @notice Library for managing utility-related data structures.
library UtilitySet {
  /// @notice Check if the player has a particular resource.
  /// @param player The address of the player.
  /// @param resource The resource to check.
  /// @return True if the player has the resource, otherwise false.
  function has(bytes32 player, EResource resource) internal view returns (bool) {
    return SetItemUtilities.get(player, resource).quantity > 0;
  }

  /// @notice Get the quantity of a resource for a player.
  /// @param player The address of the player.
  /// @param resource The resource to get.
  /// @return The quantity of the resource.
  function get(bytes32 player, EResource resource) internal view returns (uint256) {
    return SetItemUtilities.get(player, resource).quantity;
  }

  /// @notice Add a new resource to the utility set of a player.
  /// @param player The address of the player.
  /// @param resource The resource to add.
  function add(bytes32 player, EResource resource) internal {
    if (has(player, resource)) return;
    SetUtilities.push(player, uint8(resource));
    SetItemUtilities.setIndex(player, resource, SetUtilities.length(player) - 1);
  }

  /// @notice Get all resources for a player.
  /// @param player The address of the player.
  /// @return An array of all resources.
  function getAll(bytes32 player) internal view returns (uint8[] memory) {
    return SetUtilities.get(player);
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
    uint256 oldQuantity = SetItemUtilities.get(player, resource).quantity;
    if (oldQuantity == 0) {
      SetUtilities.push(player, uint8(resource));
      SetItemUtilities.set(player, resource, SetUtilities.length(player) - 1, quantity);
    } else {
      SetItemUtilities.setQuantity(player, resource, quantity);
    }
  }

  /// @notice Remove a resource from a player's utility set.
  /// @param player The address of the player.
  /// @param resource The resource to remove.
  function remove(bytes32 player, EResource resource) internal {
    SetItemUtilitiesData memory data = SetItemUtilities.get(player, resource);
    if (data.quantity == 0) return;
    if (SetUtilities.length(player) == 1) {
      clear(player);
      return;
    }
    uint8 replacement = SetUtilities.getItem(player, SetUtilities.length(player) - 1);
    SetUtilities.update(player, data.index, replacement);
    SetUtilities.pop(player);
    SetItemUtilities.deleteRecord(player, resource);
  }

  /// @notice Clear all resources for a player.
  /// @param player The address of the player.
  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetUtilities.length(player); i++) {
      SetItemUtilities.deleteRecord(player, EResource(SetUtilities.getItem(player, i)));
    }
    SetUtilities.deleteRecord(player);
  }
}
