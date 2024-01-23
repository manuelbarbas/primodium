// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";

contract FleetDisbandSystem is FleetBaseSystem {
  function disbandFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandFleet(_player(), fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) public _onlyFleetOwner(fleetId) _unitCountIsValid(unitCounts) _resourceCountIsValid(resourceCounts) {
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(_player(), fleetId, unitCounts, resourceCounts);
  }

  function disbandUnits(bytes32 fleetId, uint256[] calldata unitCounts)
    public
    _onlyFleetOwner(fleetId)
    _unitCountIsValid(unitCounts)
  {
    LibFleetDisband.disbandUnits(_player(), fleetId, unitCounts);
  }

  function disbandResources(bytes32 fleetId, uint256[] calldata resourceCounts)
    public
    _onlyFleetOwner(fleetId)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetDisband.disbandResources(_player(), fleetId, resourceCounts);
  }
}
