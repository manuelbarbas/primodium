// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetCombat } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetCombatSystem is PrimodiumSystem {
  function fleetAttackFleet(bytes32 fleetId, bytes32 targetFleet) public {
    LibFleetCombat.fleetAttackFleet(_player(false), fleetId, targetFleet);
  }

  function fleetAttackSpaceRock(bytes32 fleetId, bytes32 targetSpaceRock) public {
    LibFleetCombat.fleetAttackSpaceRock(_player(false), fleetId, targetSpaceRock);
  }

  function spaceRockAttackFleet(bytes32 spaceRock, bytes32 targetFleet) public {
    LibFleetCombat.spaceRockAttackFleet(_player(false), spaceRock, targetFleet);
  }
}
