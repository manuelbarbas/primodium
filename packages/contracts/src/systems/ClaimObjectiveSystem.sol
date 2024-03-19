// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { EObjectives } from "src/Types.sol";
import { CompletedObjective, P_EnumToPrototype, P_SpawnPirateAsteroidData, P_SpawnPirateAsteroid, Home } from "codegen/index.sol";
import { ObjectiveKey } from "src/Keys.sol";
import { S_SpawnPirateAsteroidSystem } from "systems/subsystems/S_SpawnPirateAsteroidSystem.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { LibObjectives } from "libraries/LibObjectives.sol";

contract ClaimObjectiveSystem is PrimodiumSystem {
  function claimObjective(
    bytes32 asteroidEntity,
    EObjectives objective
  ) public _claimResources(asteroidEntity) _claimUnits(asteroidEntity) {
    bytes32 playerEntity = _player();
    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(objective));

    LibObjectives.checkObjectiveRequirements(playerEntity, asteroidEntity, objective);

    IWorld world = IWorld(_world());
    world.Primodium__receiveRewards(playerEntity, asteroidEntity, objectivePrototype);

    CompletedObjective.set(playerEntity, objectivePrototype, true);
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroid.get(objectivePrototype);

    if (spawnPirateAsteroid.x != 0 || spawnPirateAsteroid.y != 0) {
      world.Primodium__spawnPirateAsteroid(playerEntity, objectivePrototype);
    }
  }
}
