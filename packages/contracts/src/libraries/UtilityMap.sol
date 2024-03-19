// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_UtilityMap, Value_UtilityMap, Meta_UtilityMap } from "codegen/index.sol";

library UtilityMap {
  function has(bytes32 playerEntity, uint8 utility) internal view returns (bool) {
    return Meta_UtilityMap.get(playerEntity, utility).stored;
  }

  function set(bytes32 playerEntity, uint8 utility, uint256 item) internal {
    if (has(playerEntity, utility)) {
      Value_UtilityMap.set(playerEntity, utility, item);
    } else {
      Keys_UtilityMap.push(playerEntity, utility);
      Value_UtilityMap.set(playerEntity, utility, item);
      Meta_UtilityMap.set(playerEntity, utility, true, Keys_UtilityMap.length(playerEntity) - 1);
    }
  }

  function get(bytes32 playerEntity, uint8 utility) internal view returns (uint256) {
    return Value_UtilityMap.get(playerEntity, utility);
  }

  function keys(bytes32 playerEntity) internal view returns (uint8[] memory) {
    return Keys_UtilityMap.get(playerEntity);
  }

  function values(bytes32 playerEntity) internal view returns (uint256[] memory items) {
    uint8[] memory _utilities = keys(playerEntity);
    items = new uint256[](_utilities.length);
    for (uint256 i = 0; i < _utilities.length; i++) {
      items[i] = Value_UtilityMap.get(playerEntity, _utilities[i]);
    }
  }

  function remove(bytes32 playerEntity, uint8 utility) internal {
    uint256 index = Meta_UtilityMap.getIndex(playerEntity, utility);
    if (Keys_UtilityMap.length(playerEntity) == 1) {
      clear(playerEntity);
      return;
    }

    // update replacement data
    uint8 replacement = Keys_UtilityMap.getItem(playerEntity, Keys_UtilityMap.length(playerEntity) - 1);
    Keys_UtilityMap.update(playerEntity, index, replacement);
    Meta_UtilityMap.set(playerEntity, replacement, true, index);

    // remove utility
    Keys_UtilityMap.pop(playerEntity);
    Value_UtilityMap.deleteRecord(playerEntity, utility);
    Meta_UtilityMap.deleteRecord(playerEntity, utility);
  }

  function size(bytes32 playerEntity) internal view returns (uint256) {
    return Keys_UtilityMap.length(playerEntity);
  }

  function clear(bytes32 playerEntity) internal {
    for (uint256 i = 0; i < Keys_UtilityMap.length(playerEntity); i++) {
      uint8 utility = Keys_UtilityMap.getItem(playerEntity, Keys_UtilityMap.length(playerEntity) - 1);
      Value_UtilityMap.deleteRecord(playerEntity, utility);
      Meta_UtilityMap.deleteRecord(playerEntity, utility);
    }
    Keys_UtilityMap.deleteRecord(playerEntity);
  }
}
