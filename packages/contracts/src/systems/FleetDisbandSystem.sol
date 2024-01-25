// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";

contract FleetDisbandSystem is FleetBaseSystem {
  function disbandFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandFleet(fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbit(fleetId)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(fleetId, unitCounts, resourceCounts);
  }

  function disbandUnits(bytes32 fleetId, uint256[] calldata unitCounts)
    public
    _onlyWhenFleetIsInOrbit(fleetId)
    _onlyFleetOwner(fleetId)
    _unitCountIsValid(unitCounts)
  {
    LibFleetDisband.disbandUnits(fleetId, unitCounts);
  }

  function disbandResources(bytes32 fleetId, uint256[] calldata resourceCounts)
    public
    _onlyFleetOwner(fleetId)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetDisband.disbandResources(fleetId, resourceCounts);
  }
}
