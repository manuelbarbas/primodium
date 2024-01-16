// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetToFleetCombatSystem is FleetBaseSystem {
  function fleetAttackFleet(bytes32 fleetId, bytes32 targetFleet)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    LibFleetCombat.fleetAttackFleet(_player(), fleetId, targetFleet);
  }
}
