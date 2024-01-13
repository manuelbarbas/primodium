// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetDisband } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetDisbandSystem is PrimodiumSystem {
  function disbandFleet(bytes32 fleetId) public {
    LibFleetDisband.disbandFleet(_player(false), fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(_player(false), fleetId, unitCounts, resourceCounts);
  }

  function disbandUnits(bytes32 fleetId, uint256[NUM_UNITS] calldata unitCounts) public {
    LibFleetDisband.disbandUnits(_player(false), fleetId, unitCounts);
  }

  function disbandResources(bytes32 fleetId, uint256[NUM_RESOURCE] calldata resourceCounts) internal {
    LibFleetDisband.disbandResources(_player(false), fleetId, resourceCounts);
  }
}
