// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_FleetSet, Meta_FleetSet } from "codegen/index.sol";

library FleetSet {
  /**
   * @dev Checks if a fleet is stored for a specific entity, and fleetEntity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   * @param fleetEntity The unique fleetEntity for the fleet.
   * @return true if the fleet exists, false otherwise.
   */
  function has(bytes32 entity, bytes32 key, bytes32 fleetEntity) internal view returns (bool) {
    return Meta_FleetSet.get(entity, key, fleetEntity).stored;
  }

  /**
   * @dev Sets a fleet for a specific entity.
   * If the fleet already exists, it updates the existing one.
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   * @param fleetEntity the unique fleetEntity for the fleet.
   */
  function add(bytes32 entity, bytes32 key, bytes32 fleetEntity) internal {
    if (has(entity, key, fleetEntity)) return;
    Keys_FleetSet.push(entity, key, fleetEntity);
    Meta_FleetSet.set(entity, key, fleetEntity, true, Keys_FleetSet.length(entity, key) - 1);
  }

  /**
   * @dev Retrieves all fleetEntities associated with an entity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   * @return fleetEntities array of fleetEntities for the fleets.
   */
  function getFleetEntities(bytes32 entity, bytes32 key) internal view returns (bytes32[] memory fleetEntities) {
    return Keys_FleetSet.get(entity, key);
  }

  /**
   * @dev Removes an fleet for a specific entity
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   * @param fleetEntity The unique fleetEntity for the fleet to remove.
   */
  function remove(bytes32 entity, bytes32 key, bytes32 fleetEntity) internal {
    if (!has(entity, key, fleetEntity)) return;
    if (Keys_FleetSet.length(entity, key) == 1) {
      clear(entity, key);
      return;
    }
    uint256 index = Meta_FleetSet.getIndex(entity, key, fleetEntity);
    bytes32 replacement = Keys_FleetSet.getItem(entity, key, Keys_FleetSet.length(entity, key) - 1);

    // update replacement data
    Keys_FleetSet.update(entity, key, index, replacement);
    Meta_FleetSet.set(entity, key, replacement, true, index);

    // remove associated fleet
    Keys_FleetSet.pop(entity, key);
    Meta_FleetSet.deleteRecord(entity, key, fleetEntity);
  }

  /**
   * @dev Retrieves the number of fleets stored for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   * @return The number of fleets.
   */
  function size(bytes32 entity, bytes32 key) internal view returns (uint256) {
    return Keys_FleetSet.length(entity, key);
  }

  /**
   * @dev Clears all fleets for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the fleet has with the entity.
   */
  function clear(bytes32 entity, bytes32 key) internal {
    for (uint256 i = 0; i < Keys_FleetSet.length(entity, key); i++) {
      bytes32 fleetEntity = Keys_FleetSet.getItem(entity, key, i);
      Meta_FleetSet.deleteRecord(entity, key, fleetEntity);
    }
    Keys_FleetSet.deleteRecord(entity, key);
  }
}
