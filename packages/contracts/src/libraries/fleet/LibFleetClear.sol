// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { OwnedBy, FleetMovement, IsFleetEmpty, IsFleet, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes } from "codegen/index.sol";

import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibFleetStance } from "libraries/fleet/LibFleet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey } from "src/Keys.sol";

/**
 * @title LibFleetClear
 * @dev Library for managing fleet clearing operations, including resource and unit management.
 */
library LibFleetClear {
  function abandonFleet(bytes32 fleetEntity) internal {
    clearFleet(fleetEntity);
    //clears any stance
    LibFleetStance.clearFleetStance(fleetEntity);
    //clears any following fleets
    LibFleetStance.clearFollowingFleets(fleetEntity);
    IsFleetEmpty.set(fleetEntity, true);

    bytes32 asteroidEntity = FleetMovement.getDestination(fleetEntity);
    FleetSet.remove(asteroidEntity, FleetIncomingKey, fleetEntity);

    bytes32 ownerAsteroidEntity = OwnedBy.get(fleetEntity);
    FleetSet.remove(ownerAsteroidEntity, FleetOwnedByKey, fleetEntity);

    FleetMovement.deleteRecord(fleetEntity);
    IsFleet.deleteRecord(fleetEntity);
    OwnedBy.deleteRecord(fleetEntity);
  }

  /**
   * @notice Clears a fleet, removing all resources and units from it.
   * @dev Iterates through all transportable resources and unit prototypes, removing them from the fleet.
   * @param fleetEntity The identifier of the fleet to clear.
   */
  function clearFleet(bytes32 fleetEntity) internal {
    uint8[] memory transportables = P_Transportables.get();
    //remove resources from fleet
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetEntity, transportables[i]);
      if (fleetResourceCount == 0) continue;
      LibFleet.decreaseFleetResource(fleetEntity, transportables[i], fleetResourceCount);
    }

    //remove units and return utility to asteroid
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCount, true);
    }
  }
  /**
   * @notice Clears specified units and resources from a fleet.
   * @dev Calls `clearResources` and `clearUnits` with the specified amounts.
   * @param fleetEntity The identifier of the fleet.
   * @param unitCounts Array of unit counts to clear, indexed by unit prototype.
   * @param resourceCounts Array of resource counts to clear, indexed by resource type.
   */
  function clearUnitsAndResourcesFromFleet(
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    clearResources(fleetEntity, resourceCounts);
    clearUnits(fleetEntity, unitCounts);
  }
  /**
   * @notice Clears specified units from a fleet.
   * @dev Iterates through unit prototypes and removes the specified amounts from the fleet.
   * Checks if the fleet has enough units to clear and enough cargo capacity after clearing.
   * @param fleetEntity The identifier of the fleet.
   * @param unitCounts Array of unit counts to clear, indexed by unit prototype.
   */
  function clearUnits(bytes32 fleetEntity, uint256[] calldata unitCounts) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to clear from fleet");
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], true);
    }
    uint256 cargoCapacity = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 cargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargoCapacity >= cargo, "[Fleet] Not enough cargo to clear units from fleet");
  }

  /**
   * @notice Clears specified resources from a fleet.
   * @dev Iterates through transportable resources and removes the specified amounts from the fleet.
   * Checks if the fleet has enough resources to clear.
   * @param fleetEntity The identifier of the fleet.
   * @param resourceCounts Array of resource counts to clear, indexed by resource type.
   */
  function clearResources(bytes32 fleetEntity, uint256[] calldata resourceCounts) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 fleetResourceCount = ResourceCount.get(fleetEntity, transportables[i]);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to clear from fleet");
      LibFleet.decreaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }
}
