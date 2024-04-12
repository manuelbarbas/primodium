// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibTransfer } from "libraries/fleet/LibTransfer.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

/**
 * @title TransferSystem
 * @dev Manages the transfer of units and resources between asteroids and fleets within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract TransferSystem is PrimodiumSystem {
  /* ---------------------------- Asteroid to Fleet --------------------------- */

  /**
   * @notice Transfers units from an asteroid to a fleet.
   * @dev Can only be called by the asteroid owner when the fleet is in orbit of the asteroid. Validates unit counts before transferring.
   * @param asteroidEntity The unique identifier for the asteroid from which units are being transferred.
   * @param fleetEntity The unique identifier for the fleet to which units are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   */
  function transferUnitsFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyOrbitingAsteroid(fleetEntity, asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
  {
    LibTransfer.transferUnitsFromAsteroidToFleet(asteroidEntity, fleetEntity, unitCounts);
  }
  /**
   * @notice Transfers resources from an asteroid to a fleet.
   * @dev Can only be called by the asteroid owner when the fleet is in orbit of the asteroid. Validates resource counts before transferring.
   * @param asteroidEntity The unique identifier for the asteroid from which resources are being transferred.
   * @param fleetEntity The unique identifier for the fleet to which resources are being transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyOrbitingAsteroid(fleetEntity, asteroidEntity)
    _claimResources(asteroidEntity)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferResourcesFromAsteroidToFleet(asteroidEntity, fleetEntity, resourceCounts);
  }

  /**
   * @notice Transfers both units and resources from an asteroid to a fleet.
   * @dev Combines the functionality of transferring units and resources into a single function call for efficiency.
   * @param asteroidEntity The unique identifier for the asteroid from which units and resources are being transferred.
   * @param fleetEntity The unique identifier for the fleet to which units and resources are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyOrbitingAsteroid(fleetEntity, asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferUnitsAndResourcesFromAsteroidToFleet(asteroidEntity, fleetEntity, unitCounts, resourceCounts);
  }

  /* ---------------------------- Fleet to Asteroid --------------------------- */

  /**
   * @notice Transfers both units and resources from an asteroid to a fleet.
   * @dev Combines the functionality of transferring units and resources into a single function call for efficiency.
   * @param fromFleetEntity The unique identifier for the fleet from which units are being transferred.
   * @param asteroidEntity The unique identifier for the asteroid to which units are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   */
  function transferUnitsFromFleetToAsteroid(
    bytes32 fromFleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetEntity)
    _onlyNotInCooldown(fromFleetEntity)
    _onlyOrbitingAsteroid(fromFleetEntity, asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
  {
    LibTransfer.transferUnitsFromFleetToAsteroid(fromFleetEntity, asteroidEntity, unitCounts);
  }

  /**
   * @notice Transfers resources from a fleet back to an orbiting asteroid.
   * @dev Can only be called by the fleet owner, when not in cooldown, and when the fleet is in orbit of the asteroid. Validates resource counts before transferring.
   * @param fleetEntity The unique identifier for the fleet from which resources are being transferred.
   * @param asteroidEntity The unique identifier for the asteroid to which resources are being transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferResourcesFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetEntity)
    _onlyNotInCooldown(fleetEntity)
    _onlyOrbitingAsteroid(fleetEntity, asteroidEntity)
    _claimResources(asteroidEntity)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferResourcesFromFleetToAsteroid(fleetEntity, asteroidEntity, resourceCounts);
  }

  /**
   * @notice Transfers both units and resources from a fleet back to an orbiting asteroid.
   * @dev Combines the functionality of transferring units and resources back to an asteroid into a single function call for efficiency.
   * @param fromFleetEntity The unique identifier for the fleet from which units and resources are being transferred.
   * @param asteroidEntity The unique identifier for the asteroid to which units and resources are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromFleetToAsteroid(
    bytes32 fromFleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetEntity)
    _onlyOrbitingAsteroid(fromFleetEntity, asteroidEntity)
    _onlyNotInCooldown(fromFleetEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferUnitsAndResourcesFromFleetToAsteroid(
      fromFleetEntity,
      asteroidEntity,
      unitCounts,
      resourceCounts
    );
  }

  /* ----------------------------- Fleet to Fleet ----------------------------- */

  /**
   * @notice Transfers units from one fleet to another fleet in the same orbit.
   * @dev Can only be called by the owner of the fromFleet, when not in cooldown, and when both fleets are in the same orbit. Validates unit counts before transferring.
   * @param fromFleetEntity The unique identifier for the fleet from which units are being transferred.
   * @param toFleetEntity The unique identifier for the fleet to which units are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   */
  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetEntity)
    _onlyNotInCooldown(fromFleetEntity)
    _onlySameOrbit(fromFleetEntity, toFleetEntity)
    _unitCountIsValid(unitCounts)
  {
    LibTransfer.transferUnitsFromFleetToFleet(fromFleetEntity, toFleetEntity, unitCounts);
  }

  /**
   * @notice Transfers resources from one fleet to another fleet in the same orbit.
   * @dev Can only be called by the owner of the fromFleet, when not in cooldown, and when both fleets are in the same orbit. Validates resource counts before transferring.
   * @param fromFleetEntity The unique identifier for the fleet from which resources are being transferred.
   * @param toFleetEntity The unique identifier for the fleet to which resources are being transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetEntity)
    _onlyNotInCooldown(fromFleetEntity)
    _onlySameOrbit(fromFleetEntity, toFleetEntity)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferResourcesFromFleetToFleet(fromFleetEntity, toFleetEntity, resourceCounts);
  }

  /**
   * @notice Transfers both units and resources from one fleet to another fleet in the same orbit.
   * @dev Combines the functionality of transferring units and resources between fleets into a single function call for efficiency.
   * @param fromFleetEntity The unique identifier for the fleet from which units and resources are being transferred.
   * @param toFleetEntity The unique identifier for the fleet to which units and resources are being transferred.
   * @param unitCounts An array of counts for each unit type to be transferred.
   * @param resourceCounts An array of counts for each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetEntity)
    _onlyNotInCooldown(fromFleetEntity)
    _onlySameOrbit(fromFleetEntity, toFleetEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibTransfer.transferUnitsAndResourcesFromFleetToFleet(fromFleetEntity, toFleetEntity, unitCounts, resourceCounts);
  }
}
