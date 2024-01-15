// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { EObjectives } from "src/Types.sol";
import { CompletedObjective, P_EnumToPrototype, P_SpawnPirateAsteroidData, P_SpawnPirateAsteroid, Home } from "codegen/index.sol";
import { ObjectiveKey } from "src/Keys.sol";
import { S_SpawnPirateAsteroidSystem } from "systems/subsystems/S_SpawnPirateAsteroidSystem.sol";
import { getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";
import { claimResources, claimUnits } from "libraries/SubsystemCalls.sol";

contract ClaimObjectiveSystem is PrimodiumSystem {
  function claimObjective(EObjectives objective) public {
    bytes32 playerEntity = _player();
    bytes32 homeAsteroid = Home.get(playerEntity);
    claimResources(homeAsteroid);
    claimUnits(homeAsteroid);

    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(objective));
    CompletedObjective.set(playerEntity, objectivePrototype, true);
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroid.get(objectivePrototype);

    if (spawnPirateAsteroid.x != 0 || spawnPirateAsteroid.y != 0) {
      SystemCall.callWithHooksOrRevert(
        DUMMY_ADDRESS,
        getSystemResourceId("S_SpawnPirateAsteroidSystem"),
        abi.encodeCall(S_SpawnPirateAsteroidSystem.spawnPirateAsteroid, (playerEntity, objectivePrototype)),
        0
      );
    }
  }
}
