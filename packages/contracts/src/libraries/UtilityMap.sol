// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MapUtilities, MapItemUtilities, MapItemStoredUtilities } from "codegen/index.sol";

library UtilityMap {
  function has(bytes32 playerEntity, uint8 utility) internal view returns (bool) {
    return MapItemStoredUtilities.get(playerEntity, utility).stored;
  }

  function set(bytes32 playerEntity, uint8 utility, uint256 item) internal {
    if (has(playerEntity, utility)) {
      MapItemUtilities.set(playerEntity, utility, item);
    } else {
      MapUtilities.push(playerEntity, utility);
      MapItemUtilities.set(playerEntity, utility, item);
      MapItemStoredUtilities.set(playerEntity, utility, true, MapUtilities.length(playerEntity) - 1);
    }
  }

  function get(bytes32 playerEntity, uint8 utility) internal view returns (uint256) {
    return MapItemUtilities.get(playerEntity, utility);
  }

  function keys(bytes32 playerEntity) internal view returns (uint8[] memory) {
    return MapUtilities.get(playerEntity);
  }

  function values(bytes32 playerEntity) internal view returns (uint256[] memory items) {
    uint8[] memory _utilities = keys(playerEntity);
    items = new uint256[](_utilities.length);
    for (uint256 i = 0; i < _utilities.length; i++) {
      items[i] = MapItemUtilities.get(playerEntity, _utilities[i]);
    }
  }

  function remove(bytes32 playerEntity, uint8 utility) internal {
    uint256 index = MapItemStoredUtilities.getIndex(playerEntity, utility);
    if (MapUtilities.length(playerEntity) == 1) {
      clear(playerEntity);
      return;
    }

    // update replacement data
    uint8 replacement = MapUtilities.getItem(playerEntity, MapUtilities.length(playerEntity) - 1);
    MapUtilities.update(playerEntity, index, replacement);
    MapItemStoredUtilities.set(playerEntity, replacement, true, index);

    // remove utility
    MapUtilities.pop(playerEntity);
    MapItemUtilities.deleteRecord(playerEntity, utility);
    MapItemStoredUtilities.deleteRecord(playerEntity, utility);
  }

  function size(bytes32 playerEntity) internal view returns (uint256) {
    return MapUtilities.length(playerEntity);
  }

  function clear(bytes32 playerEntity) internal {
    for (uint256 i = 0; i < MapUtilities.length(playerEntity); i++) {
      uint8 utility = MapUtilities.getItem(playerEntity, MapUtilities.length(playerEntity) - 1);
      MapItemUtilities.deleteRecord(playerEntity, utility);
      MapItemStoredUtilities.deleteRecord(playerEntity, utility);
    }
    MapUtilities.deleteRecord(playerEntity);
  }
}
