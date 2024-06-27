// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { Spawned, Home, Points, SpawnAllowed } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { EPointType } from "src/Types.sol";
import { LibColony } from "libraries/LibColony.sol";
import { AsteroidSet } from "libraries/AsteroidSet.sol";
import { AsteroidOwnedByKey } from "src/Keys.sol";
import { LibPlayerRegistry } from "libraries/LibPlayerRegistry.sol";

/// @title Spawn System for Primodium Game
/// @notice Handles player spawning in the game world
/// @notice Inherits from PrimodiumSystem

contract SpawnSystem is PrimodiumSystem {
  modifier onlySpawnAllowed() {
    require(SpawnAllowed.get(), "[SpawnSystem] Spawning is not allowed");
    _;
  }

  /// @notice Spawns or respawns a player into the world
  /// @notice Checks if player is already spawned and owns asteroids, sets initial level and associates asteroid
  /// @return bytes32 The entity ID of the spawned asteroid
  function spawn() public onlySpawnAllowed returns (bytes32) {
    bytes32 playerEntity = _player();

    if (!Spawned.get(playerEntity)) {
      LibColony.increaseMaxColonySlots(playerEntity);
    } else {
      require(
        AsteroidSet.getAsteroidEntities(playerEntity, AsteroidOwnedByKey).length == 0,
        "[SpawnSystem] Already spawned and owns asteroids"
      );
    }

    bytes32 asteroidEntity = LibAsteroid.createPrimaryAsteroid(playerEntity);
    Spawned.set(playerEntity, true);
    LibPlayerRegistry.add(playerEntity);
    IWorld(_world()).Pri_11__initAsteroidOwner(asteroidEntity, playerEntity);
    Home.set(playerEntity, asteroidEntity);
    for (uint8 i = 1; i < uint8(EPointType.LENGTH); i++) {
      Points.set(playerEntity, i, 0);
    }
    return asteroidEntity;
  }
}
