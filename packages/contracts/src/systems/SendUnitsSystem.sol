// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { ESendType, SendArgs, ERock, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount, OwnedBy, ResourceCount, ArrivalCount, P_EnumToPrototype, P_UnitPrototypes } from "codegen/index.sol";
import { LibMotherlode, LibSend, ArrivalsMap } from "codegen/Libraries.sol";
import { UnitKey } from "src/Keys.sol";

import { S_UpdateRockSystem } from "systems/subsystems/S_UpdateRockSystem.sol";

contract SendUnitsSystem is PrimodiumSystem {
  function _sendUnits(SendArgs memory sendArgs) internal {
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(_msgSender());

    if (destination == 0) destination = LibMotherlode.createMotherlode(sendArgs.destinationPosition);

    uint256 arrivalTime = LibSend.getArrivalTime(
      sendArgs.originPosition,
      sendArgs.destinationPosition,
      playerEntity,
      sendArgs.unitCounts
    );

    LibSend.sendUnits(
      Arrival({
        unitCounts: sendArgs.unitCounts,
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
    uint256[5] calldata unitCounts,
    ESendType sendType,
    PositionData memory origin,
    PositionData memory destination,
    bytes32 to
  ) public {
    _sendUnits(SendArgs(unitCounts, sendType, origin, destination, to));
  }
}
