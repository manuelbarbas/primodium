// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

/**
 * @title LibFleetMove
 * @dev Library for managing fleet movements, including sending, recalling, and calculating arrival times.
 */
library LibFleetMove {
  /**
   * @notice Sends a fleet to a destination.
   * @dev Moves a fleet to a new location, also moving any following fleets to the same destination.
   * @param fleetEntity The identifier of the fleet to send.
   * @param destination The destination's identifier.
   */
  function sendFleet(bytes32 fleetEntity, bytes32 destination) internal {
    bytes32 origin = FleetMovement.getDestination(fleetEntity);
    require(!isAsteroidBlocked(origin), "[Fleet] asteroid is blocked");

    uint256 speed = getSpeedWithFollowers(fleetEntity);
    require(speed > 0, "[Fleet] Fleet has no speed");

    uint256 arrivalTime = getArrivalTime(origin, Position.get(destination), speed);
    _sendFleet(fleetEntity, destination, arrivalTime);
    bytes32[] memory followingFleets = LibFleetStance.getFollowerFleets(fleetEntity);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      _sendFleet(followingFleets[i], destination, arrivalTime);
    }
  }

  function _sendFleet(bytes32 fleetEntity, bytes32 destination, uint256 arrivalTime) private {
    _sendFleet(fleetEntity, destination, block.timestamp, arrivalTime);
  }

  function _sendFleet(bytes32 fleetEntity, bytes32 destination, uint256 sendTime, uint256 arrivalTime) private {
    FleetSet.remove(FleetMovement.getDestination(fleetEntity), FleetIncomingKey, fleetEntity);
    FleetSet.add(destination, FleetIncomingKey, fleetEntity);

    FleetMovement.set(
      fleetEntity,
      FleetMovementData({
        arrivalTime: arrivalTime,
        sendTime: sendTime,
        origin: FleetMovement.getDestination(fleetEntity),
        destination: destination
      })
    );
  }

  /**
   * @notice Recalls a fleet to its origin.
   * @dev Sends the fleet back to its original location before it reached its current destination.
   * @param fleetEntity The identifier of the fleet to recall.
   */
  function recallFleet(bytes32 fleetEntity) internal {
    FleetMovementData memory fleetMovement = FleetMovement.get(fleetEntity);
    require(fleetMovement.origin != fleetMovement.destination, "[Fleet] Fleet is already at origin");
    if (block.timestamp >= fleetMovement.arrivalTime) {
      //if fleet has already reached its destination, send it back
      sendFleet(fleetEntity, fleetMovement.origin);
      return;
    }
    bytes32 destination = fleetMovement.origin;

    uint256 travelTime = fleetMovement.arrivalTime - block.timestamp;
    uint256 timePassedSinceSend = block.timestamp - fleetMovement.sendTime;

    uint256 arrivalTime = block.timestamp + timePassedSinceSend;
    uint256 sendTime = block.timestamp - travelTime;
    _sendFleet(fleetEntity, destination, sendTime, arrivalTime);

    bytes32 followingFleetsKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    bytes32[] memory followingFleets = FleetSet.getFleetEntities(fleetEntity, followingFleetsKey);

    for (uint256 i = 0; i < followingFleets.length; i++) {
      _sendFleet(followingFleets[i], destination, sendTime, arrivalTime);
    }
  }

  /**
   * @notice Calculates the arrival time of a fleet based on its speed and distance to the destination.
   * @param origin The origin's identifier.
   * @param destination The destination position data.
   * @param speed The fleet's speed.
   * @return The block timestamp when the fleet will arrive.
   */
  function getArrivalTime(
    bytes32 origin,
    PositionData memory destination,
    uint256 speed
  ) internal view returns (uint256) {
    P_GameConfigData memory config = P_GameConfig.get();

    return
      block.timestamp +
      ((LibMath.distance(Position.get(origin), destination) *
        config.travelTime *
        WORLD_SPEED_SCALE *
        UNIT_SPEED_SCALE) / (config.worldSpeed * speed));
  }

  /**
   * @dev Checks if an asteroid is blocked by a fleet with a 'Block' stance.
   * @param asteroidEntity The identifier of the asteroid to check.
   * @return True if the asteroid is blocked, false otherwise.
   */
  function isAsteroidBlocked(bytes32 asteroidEntity) private returns (bool) {
    bytes32 fleetBlockKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Block));
    return FleetSet.size(asteroidEntity, fleetBlockKey) > 0;
  }

  /**
   * @notice Determines the speed of a fleet.
   * @dev Calculates the fleet's speed based on the slowest unit in the fleet.
   * @param fleetEntity The identifier of the fleet.
   * @return speed The speed of the fleet.
   */
  function getSpeed(bytes32 fleetEntity) internal view returns (uint256 speed) {
    bytes32 ownerAsteroidEntity = OwnedBy.get(fleetEntity);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      uint256 unitLevel = UnitLevel.get(ownerAsteroidEntity, unitPrototypes[i]);
      uint256 unitSpeed = P_Unit.getSpeed(unitPrototypes[i], unitLevel);
      if (speed == 0) speed = unitSpeed;
      else if (speed > unitSpeed) speed = unitSpeed;
    }
  }

  /**
   * @notice Determines the effective speed of a fleet, taking into account any followers.
   * @dev Calculates the slowest speed among the fleet and its followers.
   * @param fleetEntity The identifier of the fleet.
   * @return speed The effective speed of the fleet considering its followers.
   */
  function getSpeedWithFollowers(bytes32 fleetEntity) internal view returns (uint256 speed) {
    speed = getSpeed(fleetEntity);
    bytes32[] memory followerFleetEntities = LibFleetStance.getFollowerFleets(fleetEntity);
    for (uint8 i = 0; i < followerFleetEntities.length; i++) {
      uint256 followerSpeed = getSpeed(followerFleetEntities[i]);
      if (followerSpeed < speed) speed = followerSpeed;
    }
  }
}
