// SPDX-License-Identifier: MIT
// This contract handles resource counting and scoring.

pragma solidity >=0.8.21;

import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { ScoreTableId } from "codegen/tables/Score.sol";
import { ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/// @title OnResourceCount_Score - Handles updating score when resource count is updated.
contract OnResourceCount_Score is StoreHook {
  constructor() {}

  /// @dev This function is called before splicing static data.
  /// @param tableId The ID of the table being operated on.
  /// @param keyTuple The key tuple of the resource count.
  /// @param start The start position of the data.
  /// @param data The data to be processed.
  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    bytes32 playerEntity = keyTuple[0];
    uint8 resource = uint8(uint256(keyTuple[1]));
    bytes memory amountRaw = SliceInstance.toBytes(SliceLib.getSubslice(data, start));
    uint256 amount = abi.decode(amountRaw, (uint256));
    LibResource.updateScore(playerEntity, resource, amount);
  }
}
