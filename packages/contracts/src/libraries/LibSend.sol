// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, Arrival, ERock, EResource } from "src/Types.sol";
import { Spawned, GracePeriod, P_GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibMath } from "libraries/LibMath.sol";
import { SendArgs } from "src/Types.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS } from "src/constants.sol";

library LibSend {
  /**
   * @dev Updates the unit count when units are sent from a specified origin by a player entity.
   * @param playerEntity The identifier of the player entity.
   * @param sendArgs The SendArgs struct containing information about the sent units.
   * @notice Checks the availability of units, deducts the sent units, and ensures that at least one unit was sent.
   */
  function updateUnitCountOnSend(bytes32 playerEntity, SendArgs memory sendArgs) internal {
    // Calculate the origin based on the provided coordinates.
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bool anyUnitsSent = false;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    // Iterate through unit prototypes and check the sent unit counts.
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (sendArgs.unitCounts[i] == 0) continue;
      uint256 count = UnitCount.get(playerEntity, origin, unitPrototypes[i]);
      // Ensure that there are enough units to send.
      require(count >= sendArgs.unitCounts[i], "[SendUnits] Not enough units to send");
      // Deduct the sent units from the unit count.
      UnitCount.set(playerEntity, origin, unitPrototypes[i], count - sendArgs.unitCounts[i]);
      anyUnitsSent = true;
    }

    // Ensure that at least one unit was sent.
    require(anyUnitsSent, "[SendUnits] No units sent");
  }

  /// @notice Adds a new arrival.
  /// @param arrival The Arrival object to add.
  function sendUnits(Arrival memory arrival) internal {
    if (
      arrival.sendType != ESendType.Reinforce && // reinforce does not remove grace period
      PirateAsteroid.get(arrival.destination).playerEntity == 0 && // pirate asteroid does not remove grace period
      Spawned.get(arrival.to)
    ) // sending to space rock without owner does not remove grace period
    {
      GracePeriod.deleteRecord(arrival.from);
    }

    bytes32 player = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    ArrivalsMap.set(player, arrival.destination, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) + 1);
  }

  /// @notice Returns the slowest speed of given unit types.
  /// @param playerEntity Entity initiating send.
  /// @param unitCounts Array of unit counts being sent.
  /// @return slowestSpeed Slowest unit speed among the types.
  function getSlowestUnitSpeed(
    bytes32 playerEntity,
    uint256[NUM_UNITS] memory unitCounts
  ) internal view returns (uint256 slowestSpeed) {
    uint256 bignum = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    slowestSpeed = bignum;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 unitLevel = UnitLevel.get(playerEntity, unitPrototypes[i]);
      uint256 speed = P_Unit.getSpeed(unitPrototypes[i], unitLevel);
      if (speed < slowestSpeed) {
        slowestSpeed = speed;
      }
    }
    if (slowestSpeed == bignum) return 0;
    return slowestSpeed;
  }

  /// @notice Computes the block number an arrival will occur.
  /// @param origin Origin position.
  /// @param destination Destination position.
  /// @param playerEntity Entity initiating send.
  /// @param unitCounts Counts of units being sent.
  /// @return Block number of arrival.
  function getArrivalTime(
    PositionData memory origin,
    PositionData memory destination,
    bytes32 playerEntity,
    uint256[NUM_UNITS] memory unitCounts
  ) internal view returns (uint256) {
    P_GameConfigData memory config = P_GameConfig.get();
    uint256 unitSpeed = getSlowestUnitSpeed(playerEntity, unitCounts);
    require(unitSpeed > 0 && config.moveSpeed > 0, "[SendUnits] Slowest unit speed must be greater than 0");

    return
      block.timestamp +
      ((LibMath.distance(origin, destination) * 100 * WORLD_SPEED_SCALE * 100) /
        (config.moveSpeed * config.worldSpeed * unitSpeed));
  }

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
      ResourceCount.get(playerEntity, uint8(EResource.U_MaxMoves)) > ArrivalCount.get(playerEntity),
      "[SendUnits] Reached max move count"
    );

    if (PirateAsteroid.get(destination).playerEntity != 0) {
      require(
        !DefeatedPirate.get(playerEntity, PirateAsteroid.get(destination).prototype),
        "[SendUnits] Cannot send to defeated pirate"
      );
      require(sendType == ESendType.Raid, "[SendUnits] Can only send to pirate asteroid to raid");
      require(
        PirateAsteroid.get(destination).playerEntity == playerEntity,
        "[SendUnits] Cannot send to other player pirate asteroid"
      );
    } else if (sendType != ESendType.Reinforce && RockType.get(destination) == uint8(ERock.Asteroid)) {
      require(GracePeriod.get(to) <= block.timestamp, "[SendUnits] Cannot send to player in grace period");
    }

    ERock originType = ERock(RockType.get(origin));
    ERock destinationType = ERock(RockType.get(destination));

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
