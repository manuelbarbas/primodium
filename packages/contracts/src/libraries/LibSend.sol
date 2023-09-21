// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ArrivalUnit, ESendType, Arrival, ERock, RockType, EResource } from "src/Types.sol";
import { PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy } from "codegen/Tables.sol";
import { ArrivalsSet } from "libraries/ArrivalsSet.sol";
import { LibMath } from "libraries/LibMath.sol";

library LibSend {
  /// @notice Adds a new arrival.
  /// @param arrival The Arrival object to add.
  function sendUnits(Arrival memory arrival) internal {
    bytes32 player = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    bytes32 asteroid = arrival.sendType == ESendType.Reinforce ? arrival.destination : arrival.origin;
    ArrivalsSet.add(player, asteroid, arrival);
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) + 1);
  }

  /// @notice Returns the slowest speed of given unit types.
  /// @param playerEntity Entity initiating send.
  /// @param unitTypes Array of unit types being sent.
  /// @return slowestSpeed Slowest unit speed among the types.
  function getSlowestUnitSpeed(bytes32 playerEntity, bytes32[] memory unitTypes)
    internal
    view
    returns (uint256 slowestSpeed)
  {
    require(unitTypes.length > 0, "[LibSend] No units sent");
    slowestSpeed = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    for (uint256 i = 0; i < unitTypes.length; i++) {
      uint256 unitLevel = UnitLevel.get(playerEntity, unitTypes[i]);
      if (unitLevel == 0) unitLevel++;
      uint256 speed = P_Unit.getSpeed(unitTypes[i], unitLevel);
      require(speed > 0, "[LibSend] Unit type has no speed");
      if (speed < slowestSpeed) {
        slowestSpeed = speed;
      }
    }
  }

  /// @notice Computes the block number an arrival will occur.
  /// @param origin Origin position.
  /// @param destination Destination position.
  /// @param playerEntity Entity initiating send.
  /// @param unitTypes Types of units being sent.
  /// @return Block number of arrival.
  function getArrivalBlock(
    PositionData memory origin,
    PositionData memory destination,
    bytes32 playerEntity,
    bytes32[] memory unitTypes
  ) internal view returns (uint256) {
    P_GameConfigData memory config = P_GameConfig.get();
    uint256 unitSpeed = getSlowestUnitSpeed(playerEntity, unitTypes);
    require(unitSpeed > 0 && config.moveSpeed > 0, "[LibSend] Unit and move speeds must be greater than 0");
    return block.timestamp + ((LibMath.distance(origin, destination) * 100 * 100) / (config.moveSpeed * unitSpeed));
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
  /// @notice Checks if movement between two positions is allowed.
  /// @param origin Origin position.
  /// @param destination Destination position.
  /// @param playerEntity Entity initiating send.
  /// @param to Destination entity.
  /// @param sendType Type of send (invade, raid, reinforce).
  function checkMovementRules(
    bytes32 origin,
    bytes32 destination,
    bytes32 playerEntity,
    bytes32 to,
    ESendType sendType
  ) internal view {
    require(
      ResourceCount.get(playerEntity, EResource.U_MaxMoves) > ArrivalCount.get(playerEntity),
      "[SendUnits] Reached max move count"
    );

    ERock originType = RockType.get(origin);
    ERock destinationType = RockType.get(destination);

    require(originType != ERock.NULL && destinationType != ERock.NULL, "[SendUnits] Must travel between rocks");
    bytes32 destinationOwner = OwnedBy.get(destination);

    require(origin != destination, "[SendUnits] Origin and destination cannot be the same");

    if (originType == ERock.Asteroid) {
      require(OwnedBy.get(origin) == playerEntity, "[SendUnits] Must move from an asteroid you own");
    }

    if (destinationType == ERock.Motherlode) {
      require(originType != ERock.Motherlode, "[SendUnits] Cannot move between motherlodes");
    }

    if (sendType == ESendType.Invade) {
      require(playerEntity != to, "[SendUnits] Cannot invade yourself");
      require(destinationType == ERock.Motherlode, "[SendUnits] Must only invade a motherlode");
    }

    if (sendType == ESendType.Raid) {
      require(playerEntity != to && to != 0, "[SendUnits] Cannot raid yourself");
      require(destinationType == ERock.Asteroid, "[SendUnits] Must only raid an asteroid");
    }

    if (sendType == ESendType.Reinforce) {
      require(destinationOwner == to && to != 0, "[SendUnits] Must only reinforce motherlode current owner");
    }
  }
}
