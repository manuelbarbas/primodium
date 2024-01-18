// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetMove {
  function sendFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 destination
  ) internal {
    bytes32 origin = FleetMovement.getDestination(fleetId);
    require(!isSpaceRockBlocked(origin), "[Fleet] Space rock is blocked");

    uint256 speed = LibFleetAttributes.getSpeedWithFollowers(fleetId);

    uint256 arrivalTime = getArrivalTime(origin, Position.get(destination), speed);
    _sendFleet(fleetId, destination, arrivalTime);
    bytes32[] memory followingFleets = LibFleetStance.getFollowerFleets(fleetId);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      _sendFleet(followingFleets[i], destination, arrivalTime);
    }
  }

  function _sendFleet(
    bytes32 fleetId,
    bytes32 destination,
    uint256 arrivalTime
  ) private {
    FleetsMap.remove(FleetMovement.getDestination(fleetId), FleetIncomingKey, fleetId);
    FleetsMap.add(destination, FleetIncomingKey, fleetId);

    FleetMovement.set(
      fleetId,
      FleetMovementData({
        arrivalTime: arrivalTime,
        sendTime: block.timestamp,
        origin: FleetMovement.getDestination(fleetId),
        destination: destination
      })
    );
  }

  function recallFleet(bytes32 playerEntity, bytes32 fleetId) internal {
    require(
      FleetMovement.getOrigin(fleetId) != FleetMovement.getDestination(fleetId),
      "[Fleet] Fleet is already at origin"
    );
    require(
      FleetMovement.getArrivalTime(fleetId) > block.timestamp,
      "[Fleet] Fleet has already reached it's destination space rock"
    );
    bytes32 destination = FleetMovement.getOrigin(fleetId);
    uint256 arrivalTime = block.timestamp + block.timestamp - FleetMovement.getSendTime(fleetId);

    _sendFleet(fleetId, destination, arrivalTime);

    bytes32 followingFleetsKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    bytes32[] memory followingFleets = FleetsMap.getFleetIds(fleetId, followingFleetsKey);

    for (uint256 i = 0; i < followingFleets.length; i++) {
      _sendFleet(followingFleets[i], destination, arrivalTime);
    }
  }

  /// @notice Computes the block number an arrival will occur.
  /// @param origin origin space rock.
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

  function isSpaceRockBlocked(bytes32 spaceRock) private returns (bool) {
    bytes32 fleetBlockKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Block));
    return FleetsMap.size(spaceRock, fleetBlockKey) > 0;
  }
}
