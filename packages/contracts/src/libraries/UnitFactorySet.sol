// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { SetUnitFactories, SetItemUnitFactories } from "codegen/index.sol";

library UnitFactorySet {
  /// @notice Check if a player has a building in UnitFactories set
  /// @param playerEntity player's entity ID
  /// @param building Building's entity ID
  /// @return True if playerEntity has building, false otherwise
  function has(bytes32 playerEntity, bytes32 building) internal view returns (bool) {
    return SetItemUnitFactories.get(playerEntity, building).stored;
  }

  /// @notice Add building to a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @param building Building's entity ID
  function add(bytes32 playerEntity, bytes32 building) internal {
    if (has(playerEntity, building)) return;
    SetUnitFactories.push(playerEntity, building);
    SetItemUnitFactories.set(playerEntity, building, true, SetUnitFactories.length(playerEntity) - 1);
  }

  /// @notice Get all buildings in a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @return Array of building entity IDs
  function getAll(bytes32 playerEntity) internal view returns (bytes32[] memory) {
    return SetUnitFactories.get(playerEntity);
  }

  /// @notice Remove building from a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  /// @param building Building's entity ID
  function remove(bytes32 playerEntity, bytes32 building) internal {
    if (!has(playerEntity, building)) return;
    if (SetUnitFactories.length(playerEntity) == 1) {
      clear(playerEntity);
      return;
    }

    bytes32 replacementId = SetUnitFactories.getItem(playerEntity, SetUnitFactories.length(playerEntity) - 1);
    uint256 index = SetItemUnitFactories.get(playerEntity, building).index;

    SetUnitFactories.update(playerEntity, index, replacementId);
    SetItemUnitFactories.setIndex(playerEntity, replacementId, index);
    SetUnitFactories.pop(playerEntity);
    SetItemUnitFactories.deleteRecord(playerEntity, building);
  }

  /// @notice Clear all buildings from a player's UnitFactories set
  /// @param playerEntity playerEntity's entity ID
  function clear(bytes32 playerEntity) internal {
    for (uint256 i = 0; i < SetUnitFactories.length(playerEntity); i++) {
      bytes32 item = SetUnitFactories.getItem(playerEntity, i);
      SetItemUnitFactories.deleteRecord(playerEntity, item);
    }
    SetUnitFactories.deleteRecord(playerEntity);
  }
}
