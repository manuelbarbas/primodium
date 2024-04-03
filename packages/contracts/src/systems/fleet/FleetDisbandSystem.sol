// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { IWorld } from "codegen/world/IWorld.sol";

/**
 * @title FleetDisbandSystem
 * @dev Manages the disbanding of fleets and their resources or units within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetDisbandSystem is PrimodiumSystem {
  /**
   * @notice Disbands an entire fleet, returning all units and resources to the respective asteroid.
   * @dev Can only be called by the fleet owner.
   * @param fleetEntity The unique identifier for the fleet to be disbanded.
   */
  function disbandFleet(bytes32 fleetEntity) public _onlyFleetOwner(fleetEntity) {
    LibFleetDisband.disbandFleet(fleetEntity);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Disbands specific units and resources from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner when the fleet is in orbit. Validates unit and resource counts.
   * @param fleetEntity The unique identifier for the fleet from which units and resources are being disbanded.
   * @param unitCounts An array of counts for each unit type to be disbanded.
   * @param resourceCounts An array of counts for each resource type to be disbanded.
   */
  function disbandUnitsAndResourcesFromFleet(
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
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(fleetEntity, unitCounts, resourceCounts);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Disbands specific units from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner when the fleet is in orbit. Validates unit counts.
   * @param fleetEntity The unique identifier for the fleet from which units are being disbanded.
   * @param unitCounts An array of counts for each unit type to be disbanded.
   */
  function disbandUnits(
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  ) public _onlyOrbiting(fleetEntity) _onlyFleetOwner(fleetEntity) _unitCountIsValid(unitCounts) {
    LibFleetDisband.disbandUnits(fleetEntity, unitCounts);
    IWorld(_world()).Primodium__resetFleetIfNoUnitsLeft(fleetEntity);
  }

  /**
   * @notice Disbands specific resources from a fleet, returning them to the respective asteroid.
   * @dev Can only be called by the fleet owner. Validates resource counts.
   * @param fleetEntity The unique identifier for the fleet from which resources are being disbanded.
   * @param resourceCounts An array of counts for each resource type to be disbanded.
   */
  function disbandResources(
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  ) public _onlyFleetOwner(fleetEntity) _resourceCountIsValid(resourceCounts) {
    LibFleetDisband.disbandResources(fleetEntity, resourceCounts);
  }
}
