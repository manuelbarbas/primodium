// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetCombatSystem is FleetBaseSystem {
  function fleetAttackFleet(bytes32 fleetId, bytes32 targetFleet)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    LibFleetCombat.fleetAttackFleet(_player(), fleetId, targetFleet);
  }

  function fleetAttackSpaceRock(bytes32 fleetId, bytes32 targetSpaceRock)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, targetSpaceRock)
  {
    LibFleetCombat.fleetAttackSpaceRock(_player(), fleetId, targetSpaceRock);
  }

  function spaceRockAttackFleet(bytes32 spaceRock, bytes32 targetFleet)
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(targetFleet, spaceRock)
  {
    LibFleetCombat.spaceRockAttackFleet(_player(), spaceRock, targetFleet);
  }
}
