// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

contract S_FleetResetIfNoUnitsLeftSystem is PrimodiumSystem {
  function resetFleetIfNoUnitsLeft(bytes32 fleetEntity) public {
    LibFleet.resetFleetIfNoUnitsLeft(fleetEntity);
  }
}
