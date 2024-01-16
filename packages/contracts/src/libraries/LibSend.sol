// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, Arrival, EResource } from "src/Types.sol";
import { Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibMath } from "libraries/LibMath.sol";
import { SendArgs } from "src/Types.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE } from "src/constants.sol";

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
      uint256 count = UnitCount.get(origin, unitPrototypes[i]);
      // Ensure that there are enough units to send.
      require(count >= sendArgs.unitCounts[i], "[SendUnits] Not enough units to send");
      // Deduct the sent units from the unit count.
      UnitCount.set(origin, unitPrototypes[i], count - sendArgs.unitCounts[i]);
      anyUnitsSent = true;
    }

    // Ensure that at least one unit was sent.
    require(anyUnitsSent, "[SendUnits] No units sent");
  }

  /// @notice Adds a new arrival.
  /// @param arrival The Arrival object to add.
  function sendUnits(Arrival memory arrival) internal returns (bytes32 arrivalId) {
    if (
      arrival.sendType != ESendType.Reinforce && // reinforce does not remove grace period
      PirateAsteroid.get(arrival.destination).playerEntity == 0 && // pirate asteroid does not remove grace period
      Spawned.get(arrival.to)
    ) // sending to space rock without owner does not remove grace period
    {
      GracePeriod.deleteRecord(arrival.from);
    }

    arrivalId = keccak256(abi.encode(arrival));
    bytes32 player = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    ArrivalsMap.set(player, arrival.destination, arrivalId, arrival);
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) + 1);
  }

  /// @notice Returns the slowest speed of given unit types.
  /// @param playerEntity Entity initiating send.
  /// @param unitCounts Array of unit counts being sent.
  /// @return slowestSpeed Slowest unit speed among the types.
  function getSlowestUnitSpeed(bytes32 playerEntity, uint256[NUM_UNITS] memory unitCounts)
    internal
    view
    returns (uint256 slowestSpeed)
  {
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
    require(unitSpeed > 0 && config.travelTime > 0, "[SendUnits] Slowest unit speed must be greater than 0");

    return
      block.timestamp +
      ((LibMath.distance(origin, destination) * config.travelTime * WORLD_SPEED_SCALE * UNIT_SPEED_SCALE) /
        (config.worldSpeed * unitSpeed));
  }
}
