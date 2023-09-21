// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IWorld } from "codegen/world/IWorld.sol";
import { ArrivalUnit, ESendType, SendArgs, ERock, EResource, EUnit, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount, RockType, OwnedBy, ResourceCount, ArrivalCount, P_EnumToPrototype } from "codegen/Tables.sol";
import { LibMotherlode, LibSend, ArrivalsMap } from "codegen/Libraries.sol";
import { UnitKey } from "src/Keys.sol";

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
    uint256[] memory unitCounts = new uint256[](sendArgs.arrivalUnits.length);
    bytes32[] memory unitTypes = new bytes32[](sendArgs.arrivalUnits.length);

    for (uint256 i = 0; i < sendArgs.arrivalUnits.length; i++) {
      EUnit unit = EUnit(sendArgs.arrivalUnits[i].unit);
      require(unit != EUnit.NULL && unit != EUnit.LENGTH, "[SendUnits] Unit type invalid");
      unitCounts[i] = sendArgs.arrivalUnits[i].count;
      unitTypes[i] = P_EnumToPrototype.get(UnitKey, uint8(unit));

      if (sendArgs.arrivalUnits[i].count == 0) continue;
      uint256 count = UnitCount.get(playerEntity, origin, unitTypes[i]);
      require(count >= sendArgs.arrivalUnits[i].count, "[SendUnits] Not enough units to send");
      UnitCount.set(playerEntity, origin, unitTypes[i], count - sendArgs.arrivalUnits[i].count);
      anyUnitsSent = true;
    }
    uint256 arrivalBlock = LibSend.getArrivalBlock(
      sendArgs.originPosition,
      sendArgs.destinationPosition,
      playerEntity,
      unitTypes
    );

    LibSend.sendUnits(
      Arrival({
        unitCounts: unitCounts,
        unitTypes: unitTypes,
        sendType: sendArgs.sendType,
        arrivalBlock: arrivalBlock,
        from: playerEntity,
        to: sendArgs.to,
        origin: origin,
        destination: destination
      })
    );
  }

  function sendUnits(
    ArrivalUnit[] calldata arrivalUnits,
    ESendType sendType,
    PositionData memory origin,
    PositionData memory destination,
    bytes32 to
  ) public {
    _sendUnits(SendArgs(arrivalUnits, sendType, origin, destination, to));
  }
}
