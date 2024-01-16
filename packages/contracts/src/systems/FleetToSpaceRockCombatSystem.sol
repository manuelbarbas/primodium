// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetToSpaceRockCombatSystem is FleetBaseSystem {
  function fleetAttackSpaceRock(bytes32 fleetId, bytes32 targetSpaceRock)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, targetSpaceRock)
  {
    LibFleetCombat.fleetAttackSpaceRock(_player(), fleetId, targetSpaceRock);
  }
}
