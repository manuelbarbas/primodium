// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { OwnedBy, P_GameConfig, GracePeriod, Spawned, P_GracePeriod, Spawned, Position, PositionData, Level, Home } from "codegen/index.sol";
import { ColoniesMap } from "src/libraries/ColoniesMap.sol";
import { LibAsteroid, LibEncode } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { BuildingKey, AsteroidOwnedByKey } from "src/Keys.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";

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
    IWorld(_world()).Primodium__initAsteroidOwner(asteroidEntity, playerEntity);
    Home.set(playerEntity, asteroidEntity);
    return asteroidEntity;
  }
}
