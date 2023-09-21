// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IWorld } from "codegen/world/IWorld.sol";
import { ArrivalUnit, ESendType, UnitCount, SendArgs, ERock, EResource, EUnit, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, RockType, OwnedBy, ResourceCount, ArrivalCount, P_EnumToPrototype } from "codegen/Tables.sol";
import { LibMotherlode, LibSend, ArrivalsSet } from "codegen/Libraries.sol";
import { UnitKey } from "src/Keys.sol";

contract SendUnitsSystem is PrimodiumSystem {
  function _sendUnits(SendArgs memory sendArgs) internal {
    IWorld world = IWorld(_world());
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(_msgSender());
    world.updateRock(playerEntity, origin);
    if (destination == 0) destination = LibMotherlode.createMotherlode(sendArgs.destinationPosition);

    checkMovementRules(origin, destination, playerEntity, sendArgs.to, sendArgs.sendType);

    bool anyUnitsSent = false;
    uint256[] memory unitCounts = new uint256[](sendArgs.arrivalUnits.length);
    bytes32[] memory unitTypes = new bytes32[](sendArgs.arrivalUnits.length);

    for (uint256 i = 0; i < sendArgs.arrivalUnits.length; i++) {
      EUnit unit = EUnit(sendArgs.arrivalUnits[i].unit);
      require(unit != EUnit.NULL && unit != EUnit.LENGTH, "SendUnitsSystem: unit type invalid");
      unitCounts[i] = sendArgs.arrivalUnits[i].count;
      unitTypes[i] = P_EnumToPrototype.get(UnitKey, uint8(unit));

      if (sendArgs.arrivalUnits[i].count == 0) continue;
      uint256 count = UnitCount.get(unitTypes[i], playerEntity, origin);
      UnitCount.set(unitTypes[i], playerEntity, origin, count - sendArgs.arrivalUnits[i].count);
      anyUnitsSent = true;
    }
    uint256 arrivalBlock = LibSend.getArrivalBlock(
      sendArgs.originPosition,
      sendArgs.destinationPosition,
      playerEntity,
      unitTypes,
      unitCounts
    );

    Arrival memory arrival = Arrival({
      unitCounts: unitCounts,
      unitTypes: unitTypes,
      sendType: sendArgs.sendType,
      arrivalBlock: arrivalBlock,
      from: playerEntity,
      to: sendArgs.to,
      origin: origin,
      destination: destination
    });

    LibSend.sendUnits(arrival);
  }

  /*
    Space rock movement rules:
      1. You can only move from an asteroid if it is yours. 
      2. You can only move from a motherlode to your asteroid. 
      3. You cannot move between motherlodes.
      4. You can only invade an enemy.
      5. You can only reinforce yourself on a motherlode.
      6. You must be under the max move count.
    */
  function checkMovementRules(
    bytes32 origin,
    bytes32 destination,
    bytes32 playerEntity,
    bytes32 to,
    ESendType sendType
  ) internal view {
    uint256 moveCount = ArrivalCount.get(playerEntity);
    uint256 maxMoveCount = ResourceCount.get(playerEntity, EResource.U_MaxMoves);

    require(
      moveCount < maxMoveCount,
      "[SendUnitsSystem] You have reached your max move count. Build or upgrade your starmapper to make more moves."
    );

    ERock originType = RockType.get(origin);
    ERock destinationType = RockType.get(destination);

    require(
      originType != ERock.NULL && destinationType != ERock.NULL,
      "[SendUnitsSystem] Must travel between asteroids or motherlodes"
    );
    if (sendType == ESendType.Reinforce || sendType == ESendType.Raid) {
      require(
        OwnedBy.get(destination) != 0,
        "[SendUnitsSystem] Reinforce and raid destinations must be a owned by player."
      );
    }

    require(origin != destination, "[SendUnitsSystem] Origin and destination cannot be the same.");

    if (originType == ERock.Asteroid) {
      require(OwnedBy.get(origin) == playerEntity, "[SendUnitsSystem] You can only move from an asteroid you own.");
    }

    if (destinationType == ERock.Motherlode) {
      require(originType != ERock.Motherlode, "[SendUnitsSystem] You cannot move between motherlodes.");
    }

    if (sendType == ESendType.Invade) {
      require(playerEntity != to, "you cannot invade yourself");
      require(destinationType == ERock.Motherlode, "you can only invade a motherlode");
    }

    if (sendType == ESendType.Raid) {
      require(playerEntity != to, "you cannot raid yourself");
      require(destinationType == ERock.Asteroid, "you can only raid a motherlode");
    }

    if (sendType == ESendType.Reinforce) {
      require(OwnedBy.get(destination) == to, "you can only reinforce the current owner of a motherlode");
    }
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
