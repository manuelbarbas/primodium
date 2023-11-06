// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { EObjectives } from "src/Types.sol";
import { CompletedObjective, P_EnumToPrototype, P_SpawnPirateAsteroidData, P_SpawnPirateAsteroid } from "codegen/index.sol";
import { ObjectiveKey } from "src/Keys.sol";
import { S_SpawnPirateAsteroidSystem } from "systems/subsystems/S_SpawnPirateAsteroidSystem.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

contract ClaimObjectiveSystem is PrimodiumSystem {
  function claimObjective(EObjectives objective) public {
    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(objective));
    CompletedObjective.set(addressToEntity(_msgSender()), objectivePrototype, true);
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroid.get(objectivePrototype);
    if (spawnPirateAsteroid.x != 0 || spawnPirateAsteroid.y != 0) {
      SystemCall.callWithHooksOrRevert(
        _msgSender(),
        getSystemResourceId("S_SpawnPirateAsteroidSystem"),
        abi.encodeCall(S_SpawnPirateAsteroidSystem.spawnPirateAsteroid, (objectivePrototype)),
        0
      );
    }
  }
}
