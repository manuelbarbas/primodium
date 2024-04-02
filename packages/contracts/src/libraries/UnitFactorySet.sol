// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_UnitFactorySet, Meta_UnitFactorySet } from "codegen/index.sol";

library UnitFactorySet {
  /// @notice Check if a player has a building in UnitFactories set
  /// @param playerEntity player's entity ID
  /// @param building Building's entity ID
  /// @return True if playerEntity has building, false otherwise
  function has(bytes32 playerEntity, bytes32 building) internal view returns (bool) {
    return Meta_UnitFactorySet.get(playerEntity, building).stored;
  }

  /// @notice Add building to a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @param building Building's entity ID
  function add(bytes32 playerEntity, bytes32 building) internal {
    if (has(playerEntity, building)) return;
    Keys_UnitFactorySet.push(playerEntity, building);
    Meta_UnitFactorySet.set(playerEntity, building, true, Keys_UnitFactorySet.length(playerEntity) - 1);
  }

  /// @notice Get all buildings in a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @return Array of building entity IDs
  function getAll(bytes32 playerEntity) internal view returns (bytes32[] memory) {
    return Keys_UnitFactorySet.get(playerEntity);
  }

  /// @notice Remove building from a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @param building Building's entity ID
  function remove(bytes32 playerEntity, bytes32 building) internal {
    if (!has(playerEntity, building)) return;
    if (Keys_UnitFactorySet.length(playerEntity) == 1) {
      clear(playerEntity);
      return;
    }

    bytes32 replacementId = Keys_UnitFactorySet.getItem(playerEntity, Keys_UnitFactorySet.length(playerEntity) - 1);
    uint256 index = Meta_UnitFactorySet.get(playerEntity, building).index;

    Keys_UnitFactorySet.update(playerEntity, index, replacementId);
    Meta_UnitFactorySet.setIndex(playerEntity, replacementId, index);
    Keys_UnitFactorySet.pop(playerEntity);
    Meta_UnitFactorySet.deleteRecord(playerEntity, building);
  }

  /// @notice Clear all buildings from a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  function clear(bytes32 playerEntity) internal {
    for (uint256 i = 0; i < Keys_UnitFactorySet.length(playerEntity); i++) {
      bytes32 item = Keys_UnitFactorySet.getItem(playerEntity, i);
      Meta_UnitFactorySet.deleteRecord(playerEntity, item);
    }
    Keys_UnitFactorySet.deleteRecord(playerEntity);
  }
}
