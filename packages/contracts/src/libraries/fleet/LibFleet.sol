// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { IsFleet, IsFleetEmpty, GracePeriod, P_GracePeriod, P_Transportables, FleetMovementData, FleetMovement, UnitCount, P_GameConfig, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibTransfer } from "libraries/fleet/LibTransfer.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

library LibFleet {
  /**
   * @notice Creates a new fleet and assigns units and resources to it from an asteroid.
   * @param playerEntity The identifier of the player creating the fleet.
   * @param asteroidEntity The identifier of the asteroid from which units and resources are drawn.
   * @param unitCounts The quantities of each unit type to be included in the fleet.
   * @param resourceCounts The quantities of each resource type to be included in the fleet.
   * @return fleetEntity The identifier of the newly created fleet.
   * @dev Decrements the corresponding units and resources from the asteroid and increments them in the new fleet.
   */
  function createFleet(
    bytes32 playerEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal returns (bytes32 fleetEntity) {
    require(ResourceCount.get(asteroidEntity, uint8(EResource.U_MaxFleets)) > 0, "[Fleet] asteroid has no max moves");
    LibStorage.decreaseStoredResource(asteroidEntity, uint8(EResource.U_MaxFleets), 1);
    fleetEntity = LibEncode.getTimedHash(playerEntity, FleetKey);
    uint256 gracePeriodLength = (P_GracePeriod.getFleet() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    GracePeriod.set(fleetEntity, block.timestamp + gracePeriodLength);

    OwnedBy.set(fleetEntity, asteroidEntity);
    IsFleet.set(fleetEntity, true);
    IsFleetEmpty.set(fleetEntity, false);

    FleetMovement.set(
      fleetEntity,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: asteroidEntity,
        destination: asteroidEntity
      })
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 asteroidUnitCount = UnitCount.get(asteroidEntity, unitPrototypes[i]);
      require(asteroidUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], false);
      increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], false);
    }

    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 asteroidResourceCount = ResourceCount.get(asteroidEntity, transportables[i]);
      require(asteroidResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      increaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }

    FleetSet.add(asteroidEntity, FleetOwnedByKey, fleetEntity);
    FleetSet.add(asteroidEntity, FleetIncomingKey, fleetEntity);
  }

  /**
   * @notice Increases the count of a specific unit type in a fleet.
   * @param fleetEntity The identifier of the fleet to modify.
   * @param unitPrototype The prototype of the unit to be added to the fleet.
   * @param unitCount The quantity of the units to be added.
   * @param updatesUtility A flag indicating whether the addition of units should update stored utilities.
   * @dev Adds units to the fleet and optionally updates the utility storage.
   */
  function increaseFleetUnit(
    bytes32 fleetEntity,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(OwnedBy.get(fleetEntity), unitPrototype, unitCount, true);
    }
    UnitCount.set(fleetEntity, unitPrototype, UnitCount.get(fleetEntity, unitPrototype) + unitCount);
  }

  /**
   * @notice Decreases the count of a specific unit type in a fleet.
   * @param fleetEntity The identifier of the fleet to modify.
   * @param unitPrototype The prototype of the unit to be removed from the fleet.
   * @param unitCount The quantity of the units to be removed.
   * @param updatesUtility A flag indicating whether the removal of units should update stored utilities.
   * @dev Removes units from the fleet and optionally updates the utility storage.
   */
  function decreaseFleetUnit(
    bytes32 fleetEntity,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototype);
    require(fleetUnitCount >= unitCount, "[Fleet] Not enough units to remove from fleet");
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(OwnedBy.get(fleetEntity), unitPrototype, unitCount, false);
    }
    UnitCount.set(fleetEntity, unitPrototype, fleetUnitCount - unitCount);
  }

  /**
   * @notice Retrieves the resource counts for a given fleet.
   * @param fleetEntity The identifier of the fleet.
   * @return resourceCounts An array of resource counts for each transportable resource.
   */
  function getResourceCounts(bytes32 fleetEntity) internal view returns (uint256[] memory resourceCounts) {
    uint8[] memory transportables = P_Transportables.get();
    resourceCounts = new uint256[](transportables.length);
    for (uint256 i = 0; i < transportables.length; i++) {
      resourceCounts[i] = ResourceCount.get(fleetEntity, transportables[i]);
    }
    return resourceCounts;
  }

  /**
   * @notice Retrieves the resource counts for a fleet, including contributions from allied fleets.
   * @param fleetEntity The identifier of the fleet.
   * @return totalResources The total number of resources across all transportable types.
   */
  function getResourceCountsWithAllies(bytes32 fleetEntity) internal view returns (uint256 totalResources) {
    bytes32[] memory followerFleetEntities = LibFleetStance.getFollowerFleets(fleetEntity);
    uint8[] memory transportables = P_Transportables.get();
    for (uint256 i = 0; i < transportables.length; i++) {
      totalResources += ResourceCount.get(fleetEntity, transportables[i]);
      for (uint8 j = 0; j < followerFleetEntities.length; j++) {
        totalResources += ResourceCount.get(followerFleetEntities[j], transportables[i]);
      }
    }
  }

  /**
   * @notice Increases the amount of a specific resource in a fleet.
   * @param fleetEntity The identifier of the fleet.
   * @param resource The type of resource to be added.
   * @param amount The quantity of the resource to be added.
   * @dev Ensures that the fleet has sufficient cargo space to store the added resources.
   */
  function increaseFleetResource(bytes32 fleetEntity, uint8 resource, uint256 amount) internal {
    if (amount == 0) return;
    uint256 freeCargoSpace = LibCombatAttributes.getCargoSpace(fleetEntity);
    require(freeCargoSpace >= amount, "[Fleet] Not enough storage to add resource");
    ResourceCount.set(fleetEntity, resource, ResourceCount.get(fleetEntity, resource) + amount);
  }

  /**
   * @notice Decreases the amount of a specific resource in a fleet.
   * @param fleetEntity The identifier of the fleet.
   * @param resource The type of resource to be removed.
   * @param amount The quantity of the resource to be removed.
   * @dev Ensures that the fleet has enough of the resource to remove the specified amount.
   */
  function decreaseFleetResource(bytes32 fleetEntity, uint8 resource, uint256 amount) internal {
    if (amount == 0) return;
    uint256 currResourceCount = ResourceCount.get(fleetEntity, resource);
    require(currResourceCount >= amount, "[Fleet] Not enough stored resource to remove");
    ResourceCount.set(fleetEntity, resource, currResourceCount - amount);
  }

  /**
   * @notice Lands a fleet on an asteroid, transferring its units and resources to the asteroid.
   * @param fleetEntity The identifier of the fleet landing on the asteroid.
   * @param asteroidEntity The identifier of the asteroid where the fleet is landing.
   * @dev Transfers all units and resources from the fleet to the asteroid. Resets the fleet's orbit if it lands on a foreign asteroid.
   */
  function landFleet(bytes32 fleetEntity, bytes32 asteroidEntity) internal {
    bytes32 asteroidOwnerEntity = OwnedBy.get(fleetEntity);

    bool isOwner = asteroidOwnerEntity == asteroidEntity;

    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetEntity, transportables[i]);
      if (fleetResourceCount == 0) continue;
      LibStorage.increaseStoredResource(asteroidEntity, transportables[i], fleetResourceCount);
      decreaseFleetResource(fleetEntity, transportables[i], fleetResourceCount);
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      if (fleetUnitCount == 0) continue;
      if (!isOwner && unitPrototypes[i] == ColonyShipPrototypeId) {
        LibTransfer.checkColonySlot(asteroidEntity, fleetUnitCount);
      }
      decreaseFleetUnit(fleetEntity, unitPrototypes[i], fleetUnitCount, !isOwner);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], fleetUnitCount, !isOwner);
    }

    LibFleetStance.clearFleetStance(fleetEntity);

    if (!isOwner) {
      resetFleetOrbit(fleetEntity);
    }
  }

  /**
   * @notice Merges multiple fleets into the first fleet in the array.
   * @param fleets An array of fleet identifiers, with the first fleet being the target for merging.
   * @dev Transfers all units and resources from the other fleets in the array to the first fleet.
   */
  function mergeFleets(bytes32[] calldata fleets) internal {
    require(fleets.length > 1, "[Fleet] Can only merge more than one fleet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint8 j = 0; j < unitPrototypes.length; j++) {
        unitCounts[j] += UnitCount.get(fleets[i], unitPrototypes[j]);
      }
    }

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      increaseFleetUnit(fleets[0], unitPrototypes[i], unitCounts[i], false);
    }
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 totalResourceCount = 0;
      for (uint256 j = 1; j < fleets.length; j++) {
        uint256 resourceCount = ResourceCount.get(fleets[j], transportables[i]);
        if (resourceCount == 0) continue;
        decreaseFleetResource(fleets[j], transportables[i], resourceCount);

        totalResourceCount += resourceCount;
      }
      if (totalResourceCount == 0) continue;
      increaseFleetResource(fleets[0], transportables[i], totalResourceCount);
    }

    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint256 j = 0; j < unitPrototypes.length; j++) {
        uint256 fleetUnitCount = UnitCount.get(fleets[i], unitPrototypes[j]);
        decreaseFleetUnit(fleets[i], unitPrototypes[j], fleetUnitCount, false);
      }

      resetFleetOrbit(fleets[i]);
    }
  }

  /**
   * @notice Checks if a fleet is empty, meaning it has no units.
   * @param fleetEntity The identifier of the fleet to check.
   * @return True if the fleet has no units, false otherwise.
   */
  function isFleetEmpty(bytes32 fleetEntity) internal view returns (bool) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (UnitCount.get(fleetEntity, unitPrototypes[i]) > 0) return false;
    }

    return true;
  }

  /**
   * @notice Resets the fleet's orbit if it has no units left.
   * @param fleetEntity The identifier of the fleet to check and potentially reset.
   * @dev Clears the fleet's stance and following fleets if it is empty.
   */
  function resetFleetIfNoUnitsLeft(bytes32 fleetEntity) internal {
    if (!isFleetEmpty(fleetEntity)) return;

    resetFleetOrbit(fleetEntity);
  }

  /**
   * @notice Checks if a fleet is empty and updates its status accordingly.
   * @param fleetEntity The identifier of the fleet to check and update.
   */
  function checkAndSetFleetEmpty(bytes32 fleetEntity) internal {
    if (isFleetEmpty(fleetEntity)) {
      IsFleetEmpty.set(fleetEntity, true);
    } else {
      IsFleetEmpty.set(fleetEntity, false);
    }
  }

  /**
   * @notice Resets a fleet's orbit, clearing any stances and following fleets.
   * @param fleetEntity The identifier of the fleet to reset.
   */
  function resetFleetOrbit(bytes32 fleetEntity) internal {
    //clears any stance
    LibFleetStance.clearFleetStance(fleetEntity);
    //clears any following fleets
    LibFleetStance.clearFollowingFleets(fleetEntity);
    IsFleetEmpty.set(fleetEntity, true);

    bytes32 asteroidEntity = FleetMovement.getDestination(fleetEntity);
    bytes32 asteroidOwnerEntity = OwnedBy.get(fleetEntity);

    if (asteroidOwnerEntity != asteroidEntity) {
      //remove fleet from incoming of current asteroid
      FleetSet.remove(asteroidEntity, FleetIncomingKey, fleetEntity);
      //set fleet to orbit of owner asteroid
      FleetSet.add(asteroidOwnerEntity, FleetIncomingKey, fleetEntity);
    }

    FleetMovement.set(
      fleetEntity,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: asteroidOwnerEntity,
        destination: asteroidOwnerEntity
      })
    );
  }
}
