// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorld } from "codegen/world/IWorld.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { Spawned, Position, PositionData, Level, Home, P_EnumToPrototype } from "codegen/index.sol";
import { LibAsteroid, LibBuilding, LibEncode } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { BuildingKey } from "src/Keys.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";

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

    Level.set(playerEntity, 1);

    bytes32 asteroid = LibAsteroid.createAsteroid(playerEntity);
    PositionData memory position = Position.get(MainBasePrototypeId);
    position.parent = asteroid;

    Home.set(playerEntity, asteroid, LibEncode.getHash(BuildingKey, position));
    SystemCall.callWithHooksOrRevert(
      _msgSender(),
      getSystemResourceId("BuildSystem"),
      abi.encodeCall(BuildSystem.build, (EBuilding.MainBase, position)),
      0
    );

    return asteroid;
  }
}
