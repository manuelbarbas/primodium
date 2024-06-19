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
   * @dev Adds player to registry. Duplicates prevented.
   * If the player already exists, it does nothing.
   * @param entity The player's entity identifier.
   */
  function add(bytes32 entity) internal {
    if (indexOf(entity) != -1) return;
    Keys_PlayerRegistry.push(entity);
  }

  /**
   * @dev Retrieves a player's entity identifier by index
   * @return playerEntity player entity identifier
   */
  function getIndex(uint256 index) internal view returns (bytes32 playerEntity) {
    return Keys_PlayerRegistry.getItem(index);
  }

  /**
   * @dev Retrieves all players registered in the registry.
   * @return playerEntities array of player entity identifiers
   */
  function getAll() internal view returns (bytes32[] memory playerEntities) {
    return Keys_PlayerRegistry.get();
  }

  /**
   * @dev Removes a registered player from the registry.
   * @param entity The player's entity identifier.
   */
  function removeEntity(bytes32 entity) internal {
    int256 index = indexOf(entity);
    if (index == -1) return;

    if (size() == 1) {
      Keys_PlayerRegistry.pop();
      return;
    }
    removeIndex(uint256(index));
  }

  /**
   * @dev Removes a registered player from the registry.
   * @param index The player's entity index in the registry.
   */
  function removeIndex(uint256 index) internal {
    if (size() <= index) {
      return;
    }

    bytes32 replacement = Keys_PlayerRegistry.getItem(size() - 1);

    // copy last player to the index being removed, overwriting the player being removed
    Keys_PlayerRegistry.update(index, replacement);

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
    uint256 listSize = size();
    if (listSize == 0) return;

    for (uint256 i = 0; i < listSize; i++) {
      Keys_PlayerRegistry.pop();
    }
  }
}
