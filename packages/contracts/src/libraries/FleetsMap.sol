// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetStatusData, MapFleets, MapStoredFleets } from "codegen/index.sol";

library FleetsMap {
  /**
   * @dev Checks if a fleet is stored for a specific entity, and fleetId.
   * @param entity The entity's identifier.
   * @param fleetId The unique fleetId for the fleet.
   * @return true if the fleet exists, false otherwise.
   */
  function has(bytes32 entity, bytes32 fleetId) internal view returns (bool) {
    return MapStoredFleets.get(entity, fleetId).stored;
  }

  /**
   * @dev Sets a fleet for a specific entity.
   * If the fleet already exists, it updates the existing one.
   * @param entity The entity's identifier.
   * @param fleetId the unique fleetId for the fleet.
   */
  function add(bytes32 entity, bytes32 fleetId) internal {
    require(!has(entity, fleetId), "[FleetsMap] Fleet is alread associated with entity");
    MapFleets.push(entity, fleetId);
    MapStoredFleets.set(entity, fleetId, true, MapFleets.length(entity) - 1);
  }

  /**
   * @dev Retrieves all fleetIds associated with an entity.
   * @param entity The entity's identifier.
   * @return fleetIds array of fleetIds for the fleets.
   */
  function getFleetIds(bytes32 entity) internal view returns (bytes32[] memory fleetIds) {
    return MapFleets.get(entity);
  }

  /**
   * @dev Removes an fleet for a specific entity
   * @param entity The entity's identifier.
   * @param fleetId The unique fleetId for the fleet to remove.
   */
  function remove(bytes32 entity, bytes32 fleetId) internal {
    if (MapFleets.length(entity) == 1) {
      clear(entity);
      return;
    }
    uint256 index = MapStoredFleets.getIndex(entity, fleetId);
    bytes32 replacement = MapFleets.getItem(entity, MapFleets.length(entity) - 1);

    // update replacement data
    MapFleets.update(entity, index, replacement);
    MapStoredFleets.set(entity, replacement, true, index);

    // remove associated fleet
    MapFleets.pop(entity);
    MapStoredFleets.deleteRecord(entity, fleetId);
  }

  /**
   * @dev Retrieves the number of fleets stored for a specific entity .
   * @param entity The entity's identifier.
   * @return The number of fleets.
   */
  function size(bytes32 entity) internal view returns (uint256) {
    return MapFleets.length(entity);
  }

  /**
   * @dev Clears all fleets for a specific entity .
   * @param entity The entity's identifier.
   */
  function clear(bytes32 entity) internal {
    for (uint256 i = 0; i < MapFleets.length(entity); i++) {
      bytes32 fleetId = MapFleets.getItem(entity, i);
      MapStoredFleets.deleteRecord(entity, fleetId);
    }
    MapFleets.deleteRecord(entity);
  }
}
