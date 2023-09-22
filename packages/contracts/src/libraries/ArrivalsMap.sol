// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Arrival } from "src/Types.sol";
import { MapArrivals, MapItemArrivals, MapItemStoredArrivals } from "codegen/Tables.sol";

library ArrivalsMap {
  function has(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal view returns (bool) {
    return MapItemStoredArrivals.get(player, asteroid, key).stored;
  }

  function set(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key,
    Arrival memory item
  ) internal {
    if (has(player, asteroid, key)) {
      MapItemArrivals.set(player, asteroid, key, abi.encode(item));
    } else {
      MapArrivals.push(player, asteroid, key);
      MapItemArrivals.set(player, asteroid, key, abi.encode(item));
      MapItemStoredArrivals.set(player, asteroid, key, true, MapArrivals.length(player, asteroid) - 1);
    }
  }

  function get(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal view returns (Arrival memory) {
    bytes memory encoding = MapItemArrivals.get(player, asteroid, key);
    return abi.decode(encoding, (Arrival));
  }

  function keys(bytes32 player, bytes32 asteroid) private view returns (bytes32[] memory) {
    return MapArrivals.get(player, asteroid);
  }

  function values(bytes32 player, bytes32 asteroid) internal view returns (Arrival[] memory items) {
    bytes32[] memory _keys = keys(player, asteroid);
    items = new Arrival[](_keys.length);
    for (uint256 i = 0; i < _keys.length; i++) {
      bytes memory encoding = MapItemArrivals.get(player, asteroid, _keys[i]);
      items[i] = abi.decode(encoding, (Arrival));
    }
  }

  function remove(
    bytes32 player,
    bytes32 asteroid,
    bytes32 key
  ) internal {
    uint256 index = MapItemStoredArrivals.getIndex(player, asteroid, key);
    if (MapArrivals.length(player, asteroid) == 1) {
      clear(player, asteroid);
      return;
    }
    bytes32 replacement = MapArrivals.getItem(player, asteroid, MapArrivals.length(player, asteroid) - 1);
    MapArrivals.update(player, asteroid, index, replacement);
    MapArrivals.pop(player, asteroid);
    MapItemArrivals.deleteRecord(player, asteroid, key);
    MapItemStoredArrivals.deleteRecord(player, asteroid, key);
  }

  function size(bytes32 player, bytes32 asteroid) internal view returns (uint256) {
    return MapArrivals.length(player, asteroid);
  }

  function clear(bytes32 player, bytes32 asteroid) internal {
    for (uint256 i = 0; i < MapArrivals.length(player, asteroid); i++) {
      bytes32 key = MapArrivals.getItem(player, asteroid, MapArrivals.length(player, asteroid) - 1);
      MapItemArrivals.deleteRecord(player, asteroid, key);
      MapItemStoredArrivals.deleteRecord(player, asteroid, key);
    }
    MapArrivals.deleteRecord(player, asteroid);
  }
}
