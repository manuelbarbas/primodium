// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetDisband } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetDisbandSystem is FleetBaseSystem {
  function disbandFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandFleet(_player(), fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(_player(), fleetId, unitCounts, resourceCounts);
  }

  function disbandUnits(bytes32 fleetId, uint256[NUM_UNITS] calldata unitCounts) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandUnits(_player(), fleetId, unitCounts);
  }

  function disbandResources(bytes32 fleetId, uint256[NUM_RESOURCE] calldata resourceCounts)
    public
    _onlyFleetOwner(fleetId)
  {
    LibFleetDisband.disbandResources(_player(), fleetId, resourceCounts);
  }
}
