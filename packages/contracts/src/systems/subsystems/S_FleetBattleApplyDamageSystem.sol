// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract S_FleetBattleApplyDamageSystem is FleetBaseSystem {
  function applyDamageToWithAllies(
    bytes32 battleId,
    bytes32 entity,
    uint256 damage
  ) public {
    LibFleetCombat.applyDamageToWithAllies(battleId, entity, damage);
  }
}
