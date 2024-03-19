// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

contract FleetCreateSystem is FleetBaseSystem {
  function createFleet(
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
    _onlyAsteroidOwner(asteroidEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
    returns (bytes32 fleetId)
  {
    fleetId = LibFleet.createFleet(_player(), asteroidEntity, unitCounts, resourceCounts);
  }
}
