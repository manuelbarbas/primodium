// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract SpaceRockToFleetCombatSystem is FleetBaseSystem {
  function spaceRockAttackFleet(bytes32 spaceRock, bytes32 targetFleet)
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(targetFleet, spaceRock)
  {
    LibFleetCombat.spaceRockAttackFleet(_player(), spaceRock, targetFleet);
  }
}
