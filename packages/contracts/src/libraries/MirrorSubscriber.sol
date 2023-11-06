pragma solidity >=0.8.21;

import { IStoreHook } from "@latticexyz/store/src/IStoreHook.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";

contract MirrorSubscriber is IStoreHook {
  constructor(ResourceId tableId, IWorld world) {}

  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public {
    StoreSwitch.spliceStaticData(OnHookChangedValueTableId, keyTuple, start, data);
    return;
  }

  function supportsInterface(bytes4 interfaceID) public view returns (bool) {
    return true;
  }

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    //  if (ResourceIdInstance.getType(_tableId) != ResourceIdInstance.getType(tableId)) revert("invalid tableId");
  }

  function onAfterSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    StoreSwitch.setRecord(OnHookChangedValueTableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public {
    //  if (ResourceIdInstance.getType(_tableId) != ResourceIdInstance.getType(tableId)) revert("invalid tableId");
    return;
  }

  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) public {
    return;
  }

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) public {
    return;
  }

  function onBeforeDeleteRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public {
    //  if (ResourceIdInstance.getType(_tableId) != ResourceIdInstance.getType(tableId)) revert("invalid tableId");
  }

  function onAfterDeleteRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public {
    StoreSwitch.deleteRecord(OnHookChangedValueTableId, keyTuple);
  }
}
