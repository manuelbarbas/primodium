// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Schema } from "@latticexyz/store/src/Schema.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";

function createPrototype(
  IStore store,
  bytes32[] memory key,
  bytes32[] memory tableIds,
  bytes[] memory values
) {
  for (uint256 i = 0; i < tableIds.length; i++) {
    bytes32 tableId = tableIds[i];
    Schema valueSchema = store.getValueSchema(tableId);
    bytes memory value = values[i];
    store.setRecord(tableId, key, value, valueSchema);
  }
}
