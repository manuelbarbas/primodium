// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IsFleet, P_EnumToPrototype, FleetStance, FleetStanceData } from "codegen/index.sol";

import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetStanceKey } from "src/Keys.sol";

import { EFleetStance } from "src/Types.sol";

/**
 * @title LibFleetStance
 * @dev Library for managing fleet stances and their interactions such as following, defending, and clearing stances.
 */
library LibFleetStance {
  /**
   * @notice Sets the stance of a fleet and its target.
   * @dev Assigns a new stance to a fleet and registers the fleet in the target's list if applicable.
   * @param fleetEntity The identifier of the fleet to set the stance for.
   * @param stance The new stance of the fleet.
   * @param target The target associated with the new stance, if applicable.
   */
  function setFleetStance(bytes32 fleetEntity, uint8 stance, bytes32 target) internal {
    clearFleetStance(fleetEntity);
    clearFollowingFleets(fleetEntity);
    FleetStance.set(fleetEntity, stance, target);
    if (target != bytes32(0)) {
      FleetSet.add(target, P_EnumToPrototype.get(FleetStanceKey, stance), fleetEntity);
    }
  }

  /**
   * @notice Clears the current stance of a fleet.
   * @dev Removes a fleet from its current stance target's list and deletes its stance record.
   * @param fleetEntity The identifier of the fleet to clear the stance for.
   */
  function clearFleetStance(bytes32 fleetEntity) internal {
    FleetStanceData memory fleetStance = FleetStance.get(fleetEntity);

    if (fleetStance.stance == uint8(EFleetStance.NULL)) return;
    FleetSet.remove(fleetStance.target, P_EnumToPrototype.get(FleetStanceKey, fleetStance.stance), fleetEntity);
    FleetStance.deleteRecord(fleetEntity);
  }

  /**
   * @notice Removes a following fleet from the leader fleet.
   * @dev Deletes the following fleet's stance record and removes it from the leader's follower list.
   * @param fleetEntity The identifier of the leader fleet.
   * @param followerFleetEntity The identifier of the following fleet to be removed.
   */
  function removeFollower(bytes32 fleetEntity, bytes32 followerFleetEntity) internal {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    require(FleetSet.has(fleetEntity, fleetFollowKey, followerFleetEntity), "[Fleet] Target fleet is not following");
    FleetStance.deleteRecord(followerFleetEntity);
    FleetSet.remove(fleetEntity, fleetFollowKey, followerFleetEntity);
  }

  /**
   * @notice Clears all following fleets from a given fleet.
   * @dev Removes all followers of a fleet, deleting their stance records.
   * @param fleetEntity The identifier of the fleet to clear followers from.
   */
  function clearFollowingFleets(bytes32 fleetEntity) internal {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    bytes32[] memory followingFleets = FleetSet.getFleetEntities(fleetEntity, fleetFollowKey);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      FleetStance.deleteRecord(followingFleets[i]);
    }
    FleetSet.clear(fleetEntity, fleetFollowKey);
  }

  /**
   * @notice Clears all defending fleets from an asteroid.
   * @dev Sets the stance of all fleets defending an asteroid to NULL and clears them from the asteroid's defender list.
   * @param asteroidEntity The identifier of the asteroid to clear defenders from.
   */
  function clearDefendingFleets(bytes32 asteroidEntity) internal {
    bytes32 fleetDefendKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Defend));
    bytes32[] memory defendingFleets = FleetSet.getFleetEntities(asteroidEntity, fleetDefendKey);
    for (uint256 i = 0; i < defendingFleets.length; i++) {
      FleetStance.set(defendingFleets[i], uint8(EFleetStance.NULL), bytes32(0));
    }
    FleetSet.clear(asteroidEntity, fleetDefendKey);
  }

  /**
   * @notice Retrieves all fleets following a given fleet.
   * @dev Returns an array of fleet identifiers that are following the specified fleet.
   * @param fleetEntity The identifier of the fleet to get followers for.
   * @return An array of fleet identifiers that are following the specified fleet.
   */
  function getFollowerFleets(bytes32 fleetEntity) internal view returns (bytes32[] memory) {
    bytes32 fleetFollowKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Follow));
    return FleetSet.getFleetEntities(fleetEntity, fleetFollowKey);
  }

  /**
   * @notice Retrieves all fleets defending a given asteroid.
   * @dev Returns an array of fleet identifiers that are defending the specified asteroid.
   * @param asteroidEntity The identifier of the asteroid to get defenders for.
   * @return An array of fleet identifiers that are defending the specified asteroid.
   */
  function getDefendingFleets(bytes32 asteroidEntity) internal view returns (bytes32[] memory) {
    bytes32 fleetDefendKey = P_EnumToPrototype.get(FleetStanceKey, uint8(EFleetStance.Defend));
    return FleetSet.getFleetEntities(asteroidEntity, fleetDefendKey);
  }

  /**
   * @notice Retrieves all allies associated with a given entity.
   * @dev Depending on whether the entity is a fleet or an asteroid, it returns either the following fleets or the defending fleets, respectively.
   * @param entity The identifier of the entity to get allies for.
   * @return An array of identifiers representing the allies of the specified entity.
   */
  function getAllies(bytes32 entity) internal view returns (bytes32[] memory) {
    return IsFleet.get(entity) ? getFollowerFleets(entity) : getDefendingFleets(entity);
  }
}
