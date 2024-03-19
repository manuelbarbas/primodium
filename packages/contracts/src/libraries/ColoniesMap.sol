// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MapColonies, MapStoredColonies } from "codegen/index.sol";

library ColoniesMap {
  /**
   * @dev Checks if a asteroid is stored for a specific entity, and asteroidEntity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity The unique asteroidEntity for the asteroid.
   * @return true if the asteroid exists, false otherwise.
   */
  function has(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal view returns (bool) {
    return MapStoredColonies.get(entity, key, asteroidEntity).stored;
  }

  /**
   * @dev Sets a asteroid for a specific entity.
   * If the asteroid already exists, it updates the existing one.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity the unique asteroidEntity for the asteroid.
   */
  function add(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal {
    require(!has(entity, key, asteroidEntity), "[ColoniesMap] asteroid is alread associated with entity");
    MapColonies.push(entity, key, asteroidEntity);
    MapStoredColonies.set(entity, key, asteroidEntity, true, MapColonies.length(entity, key) - 1);
  }

  /**
   * @dev Retrieves all asteroids associated with an entity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @return asteroidEntities array of asteroidEntities for the Colonies.
   */
  function getAsteroidEntities(bytes32 entity, bytes32 key) internal view returns (bytes32[] memory asteroidEntities) {
    return MapColonies.get(entity, key);
  }

  /**
   * @dev Removes an asteroid for a specific entity
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity The unique asteroidEntity for the asteroid to remove.
   */
  function remove(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal {
    if (MapColonies.length(entity, key) == 1) {
      clear(entity, key);
      return;
    }
    uint256 index = MapStoredColonies.getIndex(entity, key, asteroidEntity);
    bytes32 replacement = MapColonies.getItem(entity, key, MapColonies.length(entity, key) - 1);

    // update replacement data
    MapColonies.update(entity, key, index, replacement);
    MapStoredColonies.set(entity, key, replacement, true, index);

    // remove associated asteroid
    MapColonies.pop(entity, key);
    MapStoredColonies.deleteRecord(entity, key, asteroidEntity);
  }

  /**
   * @dev Retrieves the number of Colonies stored for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @return The number of Colonies.
   */
  function size(bytes32 entity, bytes32 key) internal view returns (uint256) {
    return MapColonies.length(entity, key);
  }

  /**
   * @dev Clears all Colonies for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   */
  function clear(bytes32 entity, bytes32 key) internal {
    for (uint256 i = 0; i < MapColonies.length(entity, key); i++) {
      bytes32 asteroidEntity = MapColonies.getItem(entity, key, i);
      MapStoredColonies.deleteRecord(entity, key, asteroidEntity);
    }
    MapColonies.deleteRecord(entity, key);
  }
}
