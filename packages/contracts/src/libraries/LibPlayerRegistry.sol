// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_PlayerRegistry } from "codegen/index.sol";

library LibPlayerRegistry {
  /**
   * @dev Checks if a player entity exists in the player registry.
   * @param entity The player's entity identifier.
   * @return index -1 if does not exist, otherwise the index of the player entity.
   */
  function indexOf(bytes32 entity) internal view returns (int256 index) {
    bytes32[] memory playerEntities = Keys_PlayerRegistry.get();
    uint256 listSize = playerEntities.length;

    index = -1;
    for (uint256 i = 0; i < listSize; i++) {
      if (playerEntities[i] == entity) {
        index = int256(i);
        break;
      }
    }
  }

  /**
   * @dev Adds player to registry
   * If the player already exists, it does nothing.
   * @param entity The player's entity identifier.
   */
  function add(bytes32 entity) internal {
    // if (LibPlayerRegistry.indexOf(entity) == -1) return; // TODO: Fix this line
    Keys_PlayerRegistry.push(entity);
  }

  /**
   * @dev Retrieves all players registered in the registry.
   * @return playerEntities array of player entity identifiers for the asteroids.
   */
  function getPlayerEntities() internal view returns (bytes32[] memory playerEntities) {
    return Keys_PlayerRegistry.get();
  }

  /**
   * @dev Removes a registered player from the registry.
   * @param entity The player's entity identifier.
   */
  function remove(bytes32 entity) internal {
    int256 index = LibPlayerRegistry.indexOf(entity);
    if (index == -1) return;

    if (LibPlayerRegistry.size() == 1) {
      Keys_PlayerRegistry.pop();
      return;
    }

    bytes32 replacement = Keys_PlayerRegistry.getItem(LibPlayerRegistry.size() - 1);

    // copy last player to the index being removed, overwriting the player being removed
    Keys_PlayerRegistry.update(uint256(index), replacement);

    // remove the last registered player (now a duplicate) from the list
    Keys_PlayerRegistry.pop();
  }

  /**
   * @dev Size of player entity array
   * @return length Number of registerted player entities.
   */
  function size() internal view returns (uint256 length) {
    bytes32[] memory playerEntities = Keys_PlayerRegistry.get();
    length = playerEntities.length;
  }

  /**
   * @dev Clears all registered player from the registry
   */
  function clear() internal {
    uint256 listSize = LibPlayerRegistry.size();
    if (listSize == 0) return;

    for (uint256 i = 0; i < listSize; i++) {
      Keys_PlayerRegistry.pop();
    }
  }
}
