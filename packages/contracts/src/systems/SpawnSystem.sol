// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { Spawned, Home } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibColony } from "libraries/LibColony.sol";

/// @title Spawn System for Primodium Game
/// @notice Handles player spawning in the game world
/// @notice Inherits from PrimodiumSystem
contract SpawnSystem is PrimodiumSystem {
  /// @notice Spawns a player into the world
  /// @notice Checks if player is already spawned, sets initial level and associates asteroid
  /// @return bytes32 The entity ID of the spawned asteroid
  function spawn() public returns (bytes32) {
    bytes32 playerEntity = _player();

    require(!Spawned.get(playerEntity), "[SpawnSystem] Already spawned");

    bytes32 asteroidEntity = LibAsteroid.createPrimaryAsteroid(playerEntity);
    Spawned.set(playerEntity, true);
    LibColony.increaseColonySlotsCapacity(playerEntity);
    IWorld(_world()).Primodium__initAsteroidOwner(asteroidEntity, playerEntity);
    Home.set(playerEntity, asteroidEntity);
    return asteroidEntity;
  }
}
