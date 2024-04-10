// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Keys_AsteroidSet, Meta_AsteroidSet } from "codegen/index.sol";

library AsteroidSet {
  /**
   * @dev Checks if an asteroid is stored for a specific entity, and asteroidEntity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity The unique asteroidEntity for the asteroid.
   * @return true if the asteroid exists, false otherwise.
   */
  function has(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal view returns (bool) {
    return Meta_AsteroidSet.get(entity, key, asteroidEntity).stored;
  }

  /**
   * @dev Sets an asteroid for a specific entity.
   * If the asteroid already exists, it updates the existing one.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity the unique asteroidEntity for the asteroid.
   */
  function add(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal {
    require(!has(entity, key, asteroidEntity), "[AsteroidSet] asteroid is already associated with entity");
    Keys_AsteroidSet.push(entity, key, asteroidEntity);
    Meta_AsteroidSet.set(entity, key, asteroidEntity, true, Keys_AsteroidSet.length(entity, key) - 1);
  }

  /**
   * @dev Retrieves all asteroids associated with an entity.
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @return asteroidEntities array of asteroidEntities for the asteroids.
   */
  function getAsteroidEntities(bytes32 entity, bytes32 key) internal view returns (bytes32[] memory asteroidEntities) {
    return Keys_AsteroidSet.get(entity, key);
  }

  /**
   * @dev Removes an asteroid for a specific entity
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @param asteroidEntity The unique asteroidEntity for the asteroid to remove.
   */
  function remove(bytes32 entity, bytes32 key, bytes32 asteroidEntity) internal {
    if (Keys_AsteroidSet.length(entity, key) == 1) {
      clear(entity, key);
      return;
    }
    uint256 index = Meta_AsteroidSet.getIndex(entity, key, asteroidEntity);
    bytes32 replacement = Keys_AsteroidSet.getItem(entity, key, Keys_AsteroidSet.length(entity, key) - 1);

    // update replacement data
    Keys_AsteroidSet.update(entity, key, index, replacement);
    Meta_AsteroidSet.set(entity, key, replacement, true, index);

    // remove associated asteroid
    Keys_AsteroidSet.pop(entity, key);
    Meta_AsteroidSet.deleteRecord(entity, key, asteroidEntity);
  }

  /**
   * @dev Retrieves the number of asteroids stored for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   * @return The number of asteroids.
   */
  function size(bytes32 entity, bytes32 key) internal view returns (uint256) {
    return Keys_AsteroidSet.length(entity, key);
  }

  /**
   * @dev Clears all asteroids for a specific entity .
   * @param entity The entity's identifier.
   * @param key defines the type of association the asteroid has with the entity.
   */
  function clear(bytes32 entity, bytes32 key) internal {
    for (uint256 i = 0; i < Keys_AsteroidSet.length(entity, key); i++) {
      bytes32 asteroidEntity = Keys_AsteroidSet.getItem(entity, key, i);
      Meta_AsteroidSet.deleteRecord(entity, key, asteroidEntity);
    }
    Keys_AsteroidSet.deleteRecord(entity, key);
  }
}
