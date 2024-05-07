// SPDX-License-Identifier: MIT
// This contract updates alliance points based on player points.

pragma solidity >=0.8.24;

import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Points, AlliancePointContribution, PlayerAlliance } from "codegen/index.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/// @title OnPoints_Alliance_Points - Updates alliance points based on player points.
contract OnPoints_Alliance_Points is StoreHook {
  constructor() {}

  /// @dev This function is called before splicing static data.
  /// @param keyTuple The key tuple of the player points.
  /// @param start The start position of the data.
  /// @param data The data to be processed.
  function onBeforeSpliceStaticData(
    ResourceId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    bytes32 playerEntity = keyTuple[0];
    uint8 pointsType = uint8(uint256(keyTuple[1]));
    bytes32 allianceEntity = PlayerAlliance.getAlliance(playerEntity);

    if (allianceEntity == 0) return;

    bytes memory newPointsRaw = SliceInstance.toBytes(SliceLib.getSubslice(data, start));
    uint256 newPoints = abi.decode(newPointsRaw, (uint256));
    uint256 oldPoints = Points.get(playerEntity, pointsType);
    uint256 alliancePoint = Points.get(allianceEntity, pointsType);
    uint256 prevContribution = AlliancePointContribution.get(allianceEntity, pointsType, playerEntity);

    if (newPoints > oldPoints) {
      uint256 pointsDiff = newPoints - oldPoints;
      Points.set(allianceEntity, pointsType, alliancePoint + pointsDiff);
      AlliancePointContribution.set(allianceEntity, pointsType, playerEntity, prevContribution + pointsDiff);
    } else {
      uint256 pointsDiff = oldPoints - newPoints;

      if (pointsDiff > alliancePoint) {
        Points.set(allianceEntity, pointsType, 0);
      } else Points.set(allianceEntity, pointsType, alliancePoint - pointsDiff);

      if (pointsDiff > prevContribution) {
        AlliancePointContribution.set(allianceEntity, pointsType, playerEntity, 0);
      } else AlliancePointContribution.set(allianceEntity, pointsType, playerEntity, alliancePoint - pointsDiff);
    }
  }
}
