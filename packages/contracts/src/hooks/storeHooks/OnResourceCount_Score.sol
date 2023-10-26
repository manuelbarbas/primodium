// SPDX-License-Identifier: MIT
// This contract handles resource counting and scoring.

pragma solidity >=0.8.21;

import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
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
