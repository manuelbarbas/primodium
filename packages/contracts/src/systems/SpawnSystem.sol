// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, getSystemResourceId } from "src/utils.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { BuildSystem } from "systems/BuildSystem.sol";

import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { P_GameConfig, GracePeriod, P_GracePeriod, Spawned, Position, PositionData, Level, Home } from "codegen/index.sol";

import { LibAsteroid, LibEncode } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { BuildingKey } from "src/Keys.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

/// @title Spawn System for Primodium Game
/// @notice Handles player spawning in the game world
/// @notice Inherits from PrimodiumSystem
contract SpawnSystem is PrimodiumSystem {
  /// @notice Spawns a player into the world
  /// @notice Checks if player is already spawned, sets initial level and associates asteroid
  /// @return bytes32 The entity ID of the spawned asteroid
  function spawn() public returns (bytes32) {
    bytes32 playerEntity = addressToEntity(_msgSender());

    require(!Spawned.get(playerEntity), "[SpawnSystem] Already spawned");
    uint256 gracePeriodLength = (P_GracePeriod.get() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    GracePeriod.set(playerEntity, block.timestamp + gracePeriodLength);

    bytes32 asteroid = LibAsteroid.createPrimaryAsteroid(playerEntity);
    Level.set(asteroid, 1);
    PositionData memory position = Position.get(MainBasePrototypeId);
    position.parent = asteroid;

    Home.set(playerEntity, asteroid, LibEncode.getTimedHash(BuildingKey, position));
    SystemCall.callWithHooksOrRevert(
      _msgSender(),
      getSystemResourceId("BuildSystem"),
      abi.encodeCall(BuildSystem.build, (EBuilding.MainBase, position)),
      0
    );

    return asteroid;
  }
}
