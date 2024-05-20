// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

/**
 * @title FleetLandSystem
 * @dev Manages the landing operations of fleets onto asteroids within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetLandSystem is PrimodiumSystem {
  /**
   * @notice Lands a fleet on a specified asteroid.
   * @dev Ensures the fleet is owned by the caller, not in cooldown, and in orbit of the specified asteroid. Claims necessary resources and units from the asteroid before landing the fleet.
   * @param fleetEntity The unique identifier for the fleet that is landing.
   * @param asteroidEntity The unique identifier for the asteroid on which the fleet is landing.
   */
  function landFleet(
    bytes32 fleetEntity,
    bytes32 asteroidEntity
  )
    public
    _onlyFleetOwner(fleetEntity)
    _onlyNotInCooldown(fleetEntity)
    _onlyOrbitingAsteroid(fleetEntity, asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
  {
    LibFleet.landFleet(fleetEntity, asteroidEntity);
  }
}
