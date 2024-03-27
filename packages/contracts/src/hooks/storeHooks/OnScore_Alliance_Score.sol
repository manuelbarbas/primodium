// SPDX-License-Identifier: MIT
// This contract updates alliance scores based on player scores.

pragma solidity >=0.8.24;

import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Score, PlayerAlliance } from "codegen/index.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/// @title OnScore_Alliance_Score - Updates alliance scores based on player scores.
contract OnScore_Alliance_Score is StoreHook {
  constructor() {}

  /// @dev This function is called before splicing static data.
  /// @param keyTuple The key tuple of the player score.
  /// @param start The start position of the data.
  /// @param data The data to be processed.
  function onBeforeSpliceStaticData(
    ResourceId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    bytes32 playerEntity = keyTuple[0];
    uint8 scoreType = uint8(uint256(keyTuple[1]));
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);

    if (allianceEntity == 0) return;

    bytes memory newScoreRaw = SliceInstance.toBytes(SliceLib.getSubslice(data, start));
    uint256 newScore = abi.decode(newScoreRaw, (uint256));
    uint256 oldScore = Score.get(playerEntity, scoreType);
    uint256 allianceScore = Score.get(allianceEntity, scoreType);

    if (newScore > oldScore) {
      uint256 scoreDiff = newScore - oldScore;
      Score.set(allianceEntity, scoreType, allianceScore + scoreDiff);
    } else {
      uint256 scoreDiff = oldScore - newScore;
      if (scoreDiff > allianceScore) {
        Score.set(allianceEntity, scoreType, 0);
        return;
      }
      Score.set(allianceEntity, scoreType, allianceScore - scoreDiff);
    }
  }
}
