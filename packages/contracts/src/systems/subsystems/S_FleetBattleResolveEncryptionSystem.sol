// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { console } from "forge-std/console.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";

contract S_FleetBattleResolveEncryptionSystem is PrimodiumSystem {
  function resolveBattleEncryption(bytes32 battleId, bytes32 aggressorEntity, bytes32 targetEntity) public {
    console.log("S_FleetBattleResolveEncryptionSystem.resolveBattleEncryption");
    LibFleetCombat.resolveBattleEncryption(battleId, aggressorEntity, targetEntity);
  }
}
