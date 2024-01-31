// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";

contract S_FleetBattleApplyDamageSystem is PrimodiumSystem {
  function applyDamageToWithAllies(bytes32 battleId, bytes32 entity, uint256 damage) public {
    LibFleetCombat.applyDamageToWithAllies(battleId, entity, damage);
  }
}
