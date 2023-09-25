// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IWorld } from "codegen/world/IWorld.sol";
import { ESendType, SendArgs, ERock, EResource, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount, RockType, OwnedBy, ResourceCount, ArrivalCount, P_EnumToPrototype, P_UnitPrototypes } from "codegen/Tables.sol";
import { LibMotherlode, LibSend, ArrivalsMap } from "codegen/Libraries.sol";
import { UnitKey } from "src/Keys.sol";

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

contract SendUnitsSystem is PrimodiumSystem {
  function _sendUnits(SendArgs memory sendArgs) internal {
    IWorld world = IWorld(_world());
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(_msgSender());
    world.updateRock(playerEntity, origin);
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
