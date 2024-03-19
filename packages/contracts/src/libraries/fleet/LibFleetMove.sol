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

library LibFleetMove {
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

  /// @notice Computes the block number an arrival will occur.
  /// @param origin origin asteroid.
  /// @param destination Destination position.
  /// @param speed speed of movement.
  /// @return Block number of arrival.
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

  function isAsteroidBlocked(bytes32 asteroidEntity) private returns (bool) {
    bytes32 fleetBlockKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Block));
    return FleetSet.size(asteroidEntity, fleetBlockKey) > 0;
  }

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

  function getSpeedWithFollowers(bytes32 fleetEntity) internal view returns (uint256 speed) {
    speed = getSpeed(fleetEntity);
    bytes32[] memory followerFleetEntities = LibFleetStance.getFollowerFleets(fleetEntity);
    for (uint8 i = 0; i < followerFleetEntities.length; i++) {
      uint256 followerSpeed = getSpeed(followerFleetEntities[i]);
      if (followerSpeed < speed) speed = followerSpeed;
    }
  }
}
