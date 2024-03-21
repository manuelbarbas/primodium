// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

/**
 * @title FleetCreateSystem
 * @dev Manages the creation of fleets within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetCreateSystem is PrimodiumSystem {
  /**
   * @notice Creates a new fleet from the specified asteroid with given units and resources.
   * @dev Claims necessary resources and units from the asteroid before creating the fleet. Validates ownership of the asteroid and the specified unit and resource counts.
   * @param asteroidEntity The unique identifier for the asteroid from which the fleet is being created.
   * @param unitCounts An array of counts for each unit type to include in the fleet.
   * @param resourceCounts An array of counts for each resource type to include in the fleet.
   * @return fleetEntity The unique identifier for the newly created fleet.
   */
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
    returns (bytes32 fleetEntity)
  {
    fleetEntity = LibFleet.createFleet(_player(), asteroidEntity, unitCounts, resourceCounts);
  }
}
