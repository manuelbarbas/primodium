// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ERock, EResource } from "src/Types.sol";
import { P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetAttributesData, FleetAttributes, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetStance {
  function clearFleetStance(bytes32 playerEntity, bytes32 fleetId) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only update stance for owned fleet");
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] Fleet has not reached it's current destination space rock yet"
    );
    FleetStanceData memory fleetStance = FleetStance.get(fleetId);

    if (fleetStance.stance == uint8(EFleetStance.None)) return;

    FleetsMap.remove(fleetStance.target, P_EnumToPrototype.get(FleetStanceKey, fleetStance.stance), fleetId);
    FleetStance.set(fleetId, uint8(EFleetStance.None), bytes32(0));
  }

  function clearFollowingFleets(bytes32 fleetId) internal {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    bytes32[] memory followingFleets = FleetsMap.getFleetIds(fleetId, fleetFollowKey);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      FleetStance.set(followingFleets[i], uint8(EFleetStance.None), bytes32(0));
    }
    FleetsMap.clear(fleetId, fleetFollowKey);
  }

  function getFollowerFleets(bytes32 fleetId) internal view returns (bytes32[] memory) {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    return FleetsMap.getFleetIds(fleetId, fleetFollowKey);
  }

  function setFleetStance(
    bytes32 playerEntity,
    bytes32 fleetId,
    uint8 stance,
    bytes32 target
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only update stance for owned fleet");
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] Fleet has not reached it's current destination space rock yet"
    );
    require(
      FleetStance.getStance(target) == uint8(EFleetStance.None),
      "[Fleet] Can not target a fleet that is taking a stance"
    );
    if (stance == uint8(EFleetStance.Defend) || stance == uint8(EFleetStance.Block)) {
      require(FleetMovement.getDestination(fleetId) == target, "[Fleet] Fleet must be on same space rock as target");
    }
    clearFleetStance(playerEntity, fleetId);
    clearFollowingFleets(fleetId);
    FleetStance.set(fleetId, stance, target);
    FleetsMap.add(target, P_EnumToPrototype.get(FleetStanceKey, stance), fleetId);
  }

  function removeFollower(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 followerFleetId
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only remove follower of owned fleet");
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    require(FleetsMap.has(fleetId, fleetFollowKey, followerFleetId), "[Fleet] Target fleet is not following");
    FleetStance.set(followerFleetId, uint8(EFleetStance.None), bytes32(0));
    FleetsMap.remove(fleetId, fleetFollowKey, followerFleetId);
  }
}
