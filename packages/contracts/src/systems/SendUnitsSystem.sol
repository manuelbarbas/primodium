// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { ESendType, SendArgs, ERock, EResource, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount, RockType, OwnedBy, ResourceCount, ArrivalCount, P_EnumToPrototype, P_UnitPrototypes } from "codegen/index.sol";
import { LibMotherlode, LibSend, ArrivalsMap } from "codegen/Libraries.sol";
import { UnitKey } from "src/Keys.sol";

import { S_UpdateRockSystem } from "systems/subsystems/S_UpdateRockSystem.sol";

contract SendUnitsSystem is PrimodiumSystem {
  function _sendUnits(SendArgs memory sendArgs) internal {
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(_msgSender());
    SystemCall.callWithHooksOrRevert(
      entityToAddress(playerEntity),
      getSystemResourceId("S_UpdateRockSystem"),
      abi.encodeCall(S_UpdateRockSystem.updateRock, (playerEntity, origin)),
      0
    );
    if (destination == 0) destination = LibMotherlode.createMotherlode(sendArgs.destinationPosition);

    LibSend.checkMovementRules(origin, destination, playerEntity, sendArgs.to, sendArgs.sendType);

    bool anyUnitsSent = false;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (sendArgs.unitCounts[i] == 0) continue;
      uint256 count = UnitCount.get(playerEntity, origin, unitPrototypes[i]);
      require(count >= sendArgs.unitCounts[i], "[SendUnits] Not enough units to send");
      UnitCount.set(playerEntity, origin, unitPrototypes[i], count - sendArgs.unitCounts[i]);
      anyUnitsSent = true;
    }
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
