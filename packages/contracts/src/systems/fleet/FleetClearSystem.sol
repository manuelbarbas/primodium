// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetClear } from "libraries/fleet/LibFleetClear.sol";
import { IWorld } from "codegen/world/IWorld.sol";

/**
 * @title FleetClearSystem
 * @dev Manages the clearing of fleets and their resources or units within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetClearSystem is PrimodiumSystem {
  function abandonFleet(bytes32 fleetEntity) public _onlyFleetOwner(fleetEntity) {
    // LibFleetClear.abandonFleet(fleetEntity);
  }

  /**
   * @notice Clears an entire fleet, returning all units and resources to the respective asteroid.
   * @dev Can only be called by the fleet owner.
   * @param fleetEntity The unique identifier for the fleet to be cleared.
   */
  function clearFleet(bytes32 fleetEntity) public _onlyFleetOwner(fleetEntity) {
    LibFleetClear.clearFleet(fleetEntity);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Clears specific units and resources from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner when the fleet is in orbit. Validates unit and resource counts.
   * @param fleetEntity The unique identifier for the fleet from which units and resources are being cleared.
   * @param unitCounts An array of counts for each unit type to be cleared.
   * @param resourceCounts An array of counts for each resource type to be cleared.
   */
  function clearUnitsAndResourcesFromFleet(
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetEntity)
    _onlyOrbiting(fleetEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetClear.clearUnitsAndResourcesFromFleet(fleetEntity, unitCounts, resourceCounts);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Clears specific units from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner when the fleet is in orbit. Validates unit counts.
   * @param fleetEntity The unique identifier for the fleet from which units are being cleared.
   * @param unitCounts An array of counts for each unit type to be cleared.
   */
  function clearUnits(
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  ) public _onlyOrbiting(fleetEntity) _onlyFleetOwner(fleetEntity) _unitCountIsValid(unitCounts) {
    LibFleetClear.clearUnits(fleetEntity, unitCounts);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Clears specific resources from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner. Validates resource counts.
   * @param fleetEntity The unique identifier for the fleet from which resources are being cleared.
   * @param resourceCounts An array of counts for each resource type to be cleared.
   */
  function clearResources(
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  ) public _onlyFleetOwner(fleetEntity) _resourceCountIsValid(resourceCounts) {
    LibFleetClear.clearResources(fleetEntity, resourceCounts);
  }
}
