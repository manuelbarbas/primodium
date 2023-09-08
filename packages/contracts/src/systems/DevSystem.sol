// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

contract DevSystem is System {
  /**
   * Write a record in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function devSetRecord(
    bytes32 tableId,
    bytes32[] calldata key,
    bytes calldata data,
    Schema valueSchema
  ) public virtual {
    StoreCore.setRecord(tableId, key, data, valueSchema);
  }

  /**
   * Write a field in the table at the given tableId.
   */
  function devSetField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    Schema valueSchema
  ) public virtual {
    StoreCore.setField(tableId, key, schemaIndex, data, valueSchema);
  }

  /**
   * Push data to the end of a field in the table at the given tableId.
   */
  function devPushToField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    Schema valueSchema
  ) public virtual {
    StoreCore.pushToField(tableId, key, schemaIndex, dataToPush, valueSchema);
  }

  /**
   * Pop data from the end of a field in the table at the given tableId.
   */
  function devPopFromField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    Schema valueSchema
  ) public virtual {
    // Push to the field
    StoreCore.popFromField(tableId, key, schemaIndex, byteLengthToPop, valueSchema);
  }

  /**
   * Update data at `startByteIndex` of a field in the table at the given tableId.
   */
  function devUpdateInField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    Schema valueSchema
  ) public virtual {
    // Update data in the field
    StoreCore.updateInField(tableId, key, schemaIndex, startByteIndex, dataToSet, valueSchema);
  }

  /**
   * Delete a record in the table at the given tableId.
   * Requires the caller to have access to the namespace or name.
   */
  function devDeleteRecord(
    bytes32 tableId,
    bytes32[] calldata key,
    Schema valueSchema
  ) public virtual {
    // Delete the record
    StoreCore.deleteRecord(tableId, key, valueSchema);
  }
}
