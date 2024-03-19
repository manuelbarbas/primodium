// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { IsFleet, P_EnumToPrototype, FleetStance, FleetStanceData, Position, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetStance {
  function setFleetStance(bytes32 fleetEntity, uint8 stance, bytes32 target) internal {
    clearFleetStance(fleetEntity);
    clearFollowingFleets(fleetEntity);
    FleetStance.set(fleetEntity, stance, target);
    if (target != bytes32(0)) {
      FleetSet.add(target, P_EnumToPrototype.get(FleetStanceKey, stance), fleetEntity);
    }
  }

  function clearFleetStance(bytes32 fleetEntity) internal {
    FleetStanceData memory fleetStance = FleetStance.get(fleetEntity);

    if (fleetStance.stance == uint8(EFleetStance.NULL)) return;
    FleetSet.remove(fleetStance.target, P_EnumToPrototype.get(FleetStanceKey, fleetStance.stance), fleetEntity);
    FleetStance.deleteRecord(fleetEntity);
  }

  function removeFollower(bytes32 fleetEntity, bytes32 followerFleetEntity) internal {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    require(FleetSet.has(fleetEntity, fleetFollowKey, followerFleetEntity), "[Fleet] Target fleet is not following");
    FleetStance.deleteRecord(followerFleetEntity);
    FleetSet.remove(fleetEntity, fleetFollowKey, followerFleetEntity);
  }

  function clearFollowingFleets(bytes32 fleetEntity) internal {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    bytes32[] memory followingFleets = FleetSet.getFleetEntities(fleetEntity, fleetFollowKey);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      FleetStance.deleteRecord(followingFleets[i]);
    }
    FleetSet.clear(fleetEntity, fleetFollowKey);
  }

  function clearDefendingFleets(bytes32 asteroidEntity) internal {
    bytes32 fleetDefendKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Defend));
    bytes32[] memory defendingFleets = FleetSet.getFleetEntities(asteroidEntity, fleetDefendKey);
    for (uint256 i = 0; i < defendingFleets.length; i++) {
      FleetStance.set(defendingFleets[i], uint8(EFleetStance.NULL), bytes32(0));
    }
    FleetSet.clear(asteroidEntity, fleetDefendKey);
  }

  function getFollowerFleets(bytes32 fleetEntity) internal view returns (bytes32[] memory) {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    return FleetSet.getFleetEntities(fleetEntity, fleetFollowKey);
  }

  function getDefendingFleets(bytes32 asteroidEntity) internal view returns (bytes32[] memory) {
    bytes32 fleetDefendKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Defend));
    return FleetSet.getFleetEntities(asteroidEntity, fleetDefendKey);
  }

  function getAllies(bytes32 entity) internal view returns (bytes32[] memory) {
    return IsFleet.get(entity) ? getFollowerFleets(entity) : getDefendingFleets(entity);
  }
}
