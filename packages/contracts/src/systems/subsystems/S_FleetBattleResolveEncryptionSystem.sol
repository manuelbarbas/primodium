// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { NewBattleResultData } from "codegen/index.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract S_FleetBattleResolveEncryptionSystem is FleetBaseSystem {
  function resolveBattleEncryption(bytes32 battleId, NewBattleResultData memory battleResult) public {
    LibFleetCombat.resolveBattleEncryption(battleId, battleResult);
  }
}
