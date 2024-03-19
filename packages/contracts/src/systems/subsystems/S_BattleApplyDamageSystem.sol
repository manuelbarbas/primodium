// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibCombat } from "libraries/LibCombat.sol";

contract S_BattleApplyDamageSystem is PrimodiumSystem {
  function applyDamage(
    bytes32 battleId,
    bytes32 attackingPlayer,
    bytes32 defender,
    uint256 damage
  ) public returns (uint256) {
    return LibCombat.applyDamage(battleId, attackingPlayer, defender, damage);
  }
}
