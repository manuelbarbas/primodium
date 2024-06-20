// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibCombat } from "libraries/LibCombat.sol";

contract S_BattleEncryptionResolveSystem is PrimodiumSystem {
  function resolveBattleEncryption(bytes32 battleEntity, bytes32 targetAsteroid, bytes32 aggressorEntity) public {
    LibCombat.resolveBattleEncryption(battleEntity, targetAsteroid, aggressorEntity);
  }

  function resolveConquerColonyShip(bytes32 asteroidTargetEntity, bytes32 aggressorEntity) public {
    LibCombat.resolveConquerColonyShip(asteroidTargetEntity, aggressorEntity);
  }
}
