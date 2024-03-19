// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

contract S_FleetResetIfNoUnitsLeftSystem is PrimodiumSystem {
  function resetFleetIfNoUnitsLeft(bytes32 fleetId) public {
    LibFleet.resetFleetIfNoUnitsLeft(fleetId);
  }
}
