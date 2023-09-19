// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EResource } from "src/Types.sol";
import { SetUnitFactories, SetItemUnitFactories } from "codegen/Tables.sol";

library UnitFactorySet {
  function has(bytes32 player, bytes32 building) internal view returns (bool) {
    return SetItemUnitFactories.get(player, building).stored;
  }

  function add(bytes32 player, bytes32 building) internal {
    if (has(player, building)) return;
    SetUnitFactories.push(player, building);
    SetItemUnitFactories.set(player, building, true, SetUnitFactories.length(player) - 1);
  }

  function getAll(bytes32 player) internal view returns (bytes32[] memory) {
    return SetUnitFactories.get(player);
  }

  function remove(bytes32 player, bytes32 building) internal {
    if (!has(player, building)) return;
    if (SetUnitFactories.length(player) == 1) {
      clear(player);
      return;
    }

    bytes32 replacementId = SetUnitFactories.getItem(player, SetUnitFactories.length(player) - 1);
    uint256 index = SetItemUnitFactories.get(player, building).index;

    SetUnitFactories.update(player, index, replacementId);
    SetItemUnitFactories.setIndex(player, replacementId, index);
    SetUnitFactories.pop(player);
    SetItemUnitFactories.deleteRecord(player, building);
  }

  function clear(bytes32 player) internal {
    for (uint256 i = 0; i < SetUnitFactories.length(player); i++) {
      bytes32 item = SetUnitFactories.getItem(player, i);
      SetItemUnitFactories.deleteRecord(player, item);
    }
    SetUnitFactories.deleteRecord(player);
  }
}
