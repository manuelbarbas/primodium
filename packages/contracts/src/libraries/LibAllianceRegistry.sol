// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_AllianceRegistry } from "codegen/index.sol";

library LibAllianceRegistry {
  /**
   * @dev Checks if a alliance entity exists in the alliance registry.
   * @param entity The alliance's entity identifier.
   * @return index -1 if does not exist, otherwise the index of the alliance entity.
   */
  function indexOf(bytes32 entity) internal view returns (int256 index) {
    bytes32[] memory allianceEntities = Keys_AllianceRegistry.get();
    uint256 listSize = allianceEntities.length;

    index = -1;
    for (uint256 i = 0; i < listSize; i++) {
      if (allianceEntities[i] == entity) {
        index = int256(i);
        break;
      }
    }
  }

  /**
   * @dev Adds alliance to registry. Duplicates prevented.
   * If the alliance already exists, it does nothing.
   * @param entity The alliance's entity identifier.
   */
  function add(bytes32 entity) internal {
    if (indexOf(entity) != -1) return;
    Keys_AllianceRegistry.push(entity);
  }

  /**
   * @dev Retrieves a alliance's entity identifier by index
   * @return allianceEntity alliance entity identifier
   */
  function getIndex(uint256 index) internal view returns (bytes32 allianceEntity) {
    return Keys_AllianceRegistry.getItem(index);
  }

  /**
   * @dev Retrieves all alliances registered in the registry.
   * @return allianceEntities array of alliance entity identifiers
   */
  function getAll() internal view returns (bytes32[] memory allianceEntities) {
    return Keys_AllianceRegistry.get();
  }

  /**
   * @dev Removes a registered alliance from the registry.
   * @param entity The alliance's entity identifier.
   */
  function removeEntity(bytes32 entity) internal {
    int256 index = indexOf(entity);
    if (index == -1) return;

    if (size() == 1) {
      Keys_AllianceRegistry.pop();
      return;
    }
    removeIndex(uint256(index));
  }

  /**
   * @dev Removes a registered alliance from the registry.
   * @param index The alliance's entity index in the registry.
   */
  function removeIndex(uint256 index) internal {
    if (size() <= index) {
      return;
    }

    bytes32 replacement = Keys_AllianceRegistry.getItem(size() - 1);

    // copy last alliance to the index being removed, overwriting the alliance being removed
    Keys_AllianceRegistry.update(index, replacement);

    // remove the last registered alliance (now a duplicate) from the list
    Keys_AllianceRegistry.pop();
  }

  /**
   * @dev Size of alliance entity array
   * @return length Number of registerted alliance entities.
   */
  function size() internal view returns (uint256 length) {
    bytes32[] memory allianceEntities = Keys_AllianceRegistry.get();
    length = allianceEntities.length;
  }

  /**
   * @dev Clears all registered alliance from the registry
   */
  function clear() internal {
    uint256 listSize = size();
    if (listSize == 0) return;

    for (uint256 i = 0; i < listSize; i++) {
      Keys_AllianceRegistry.pop();
    }
  }
}
