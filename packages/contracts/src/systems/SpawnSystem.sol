// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Spawned, Position, PositionData, Level } from "codegen/Tables.sol";
import { LibAsteroid, LibBuilding } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";

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
    PositionData memory position = Position.get(MainBasePrototypeId);
    position.parent = asteroid;
    LibBuilding.build(playerEntity, EBuilding.MainBase, position);
    return asteroid;
  }
}
