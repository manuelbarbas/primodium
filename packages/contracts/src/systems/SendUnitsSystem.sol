// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { addressToEntity } from "src/utils.sol";

import { ESendType, SendArgs, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount } from "codegen/index.sol";
import { LibSend } from "codegen/Libraries.sol";
import { NUM_UNITS } from "src/constants.sol";

contract SendUnitsSystem is PrimodiumSystem {
  function _sendUnits(SendArgs memory sendArgs) internal {
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(_msgSender());

    uint256 arrivalTime = LibSend.getArrivalTime(
      sendArgs.originPosition,
      sendArgs.destinationPosition,
      playerEntity,
      sendArgs.unitCounts
    );

    LibSend.sendUnits(
      Arrival({
        unitCounts: sendArgs.unitCounts,
        sendTime: block.timestamp,
        sendType: sendArgs.sendType,
        arrivalTime: arrivalTime,
        from: playerEntity,
        to: sendArgs.to,
        origin: origin,
        destination: destination
      })
    );
  }

  function sendUnits(
    uint256[NUM_UNITS] calldata unitCounts,
    ESendType sendType,
    PositionData memory origin,
    PositionData memory destination,
    bytes32 to
  ) public {
    _sendUnits(SendArgs(unitCounts, sendType, origin, destination, to));
  }
}
