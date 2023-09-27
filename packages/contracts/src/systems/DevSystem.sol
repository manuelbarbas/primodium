// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";

contract DevSystem is System {
  /**
   * Write a record in the table at the given tableId.
   */
  function devSetRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData
  ) public {
    // Set the record
    IWorld(_world()).setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  function devSpliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    bytes calldata data
  ) public {
    // Splice the static data
    IWorld(_world()).spliceStaticData(tableId, keyTuple, start, data);
  }

  function devSpliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public {
    // Splice the dynamic data
    IWorld(_world()).spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  /**
   * Write a field in the table at the given tableId.
   */
  function devSetField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data
  ) public {
    // Set the field
    IWorld(_world()).setField(tableId, keyTuple, fieldIndex, data);
  }

  /**
   * Write a field in the table at the given tableId.
   */
  function devSetField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    // Set the field
    IWorld(_world()).setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  /**
   * Write a static field in the table at the given tableId.
   */
  function devSetStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    // Set the field
    IWorld(_world()).setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  /**
   * Write a dynamic field in the table at the given tableId.
   */
  function devSetDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public {
    // Set the field
    IWorld(_world()).setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  /**
   * Push data to the end of a field in the table at the given tableId.
   */
  function devPushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public {
    // Push to the field
    IWorld(_world()).pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  /**
   * Pop data from the end of a field in the table at the given tableId.
   */
  function devPopFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public {
    // Push to the field
    IWorld(_world()).popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  /**
   * Delete a record in the table at the given tableId.
   */
  function devDeleteRecord(ResourceId tableId, bytes32[] calldata keyTuple) public {
    // Delete the record
    IWorld(_world()).deleteRecord(tableId, keyTuple);
  }
}
