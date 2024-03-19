// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { P_Transportables, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

/**
 * @title LibFleetDisband
 * @dev Library for managing fleet disbanding operations, including resource and unit management.
 */
library LibFleetDisband {
  /**
   * @notice Disbands a fleet, removing all resources and units from it.
   * @dev Iterates through all transportable resources and unit prototypes, removing them from the fleet.
   * @param fleetEntity The identifier of the fleet to disband.
   */
  function disbandFleet(bytes32 fleetEntity) internal {
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
   * @notice Disbands specified units and resources from a fleet.
   * @dev Calls `disbandResources` and `disbandUnits` with the specified amounts.
   * @param fleetEntity The identifier of the fleet.
   * @param unitCounts Array of unit counts to disband, indexed by unit prototype.
   * @param resourceCounts Array of resource counts to disband, indexed by resource type.
   */
  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    disbandResources(fleetEntity, resourceCounts);
    disbandUnits(fleetEntity, unitCounts);
  }
  /**
   * @notice Disbands specified units from a fleet.
   * @dev Iterates through unit prototypes and removes the specified amounts from the fleet.
   * Checks if the fleet has enough units to disband and enough cargo capacity after disbanding.
   * @param fleetEntity The identifier of the fleet.
   * @param unitCounts Array of unit counts to disband, indexed by unit prototype.
   */
  function disbandUnits(bytes32 fleetEntity, uint256[] calldata unitCounts) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to disband from fleet");
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], true);
    }
    uint256 cargoCapacity = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 cargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargoCapacity >= cargo, "[Fleet] Not enough cargo to disband units from fleet");
  }

  /**
   * @notice Disbands specified resources from a fleet.
   * @dev Iterates through transportable resources and removes the specified amounts from the fleet.
   * Checks if the fleet has enough resources to disband.
   * @param fleetEntity The identifier of the fleet.
   * @param resourceCounts Array of resource counts to disband, indexed by resource type.
   */
  function disbandResources(bytes32 fleetEntity, uint256[] calldata resourceCounts) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 fleetResourceCount = ResourceCount.get(fleetEntity, transportables[i]);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to disband from fleet");
      LibFleet.decreaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }
}
