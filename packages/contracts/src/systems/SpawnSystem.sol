// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem } from "./internal/PrimodiumSystem.sol";

import { Spawned, Position, PositionData, Level } from "codegen/Tables.sol";
import { LibAsteroid } from "libraries/Libraries.sol";

/// @title Spawn System for Primodium Game
/// @notice Handles player spawning in the game world
/// @dev Inherits from PrimodiumSystem
contract SpawnSystem is PrimodiumSystem {
  /// @notice Spawns a player into the world
  /// @dev Checks if player is already spawned, sets initial level and associates asteroid
  /// @return bytes32 The entity ID of the spawned asteroid
  function spawn() public returns (bytes32) {
    bytes32 playerEntity = addressToEntity(_msgSender());

    bool spawned = Spawned.get(playerEntity);

    require(!spawned, "[SpawnSystem] Player already spawned");

    Level.set(playerEntity, 1);

    bytes32 asteroid = LibAsteroid.createAsteroid(_world(), playerEntity);
    return asteroid;
  }
}
