// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { P_Transportables, OwnedBy, P_UnitPrototypes, Asteroid, IsFleet, ColonySlots } from "codegen/index.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";

/**
 * @title LibTransfer
 * @dev Library for transferring units and resources between fleets and asteroids, including validations for ownership and capacity.
 */
library LibTransfer {
  /**
   * @notice Transfers units from an asteroid to a fleet, considering ownership and unit type restrictions.
   * @param asteroidEntity The identifier of the asteroid from which units are transferred.
   * @param fleetEntity The identifier of the fleet to which units are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   */
  function transferUnitsFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(fleetEntity, unitCounts[i]);
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  /**
   * @notice Transfers resources from an asteroid to a fleet.
   * @param asteroidEntity The identifier of the asteroid from which resources are transferred.
   * @param fleetEntity The identifier of the fleet to which resources are transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.decreaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.increaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  /**
   * @notice Transfers both units and resources from an asteroid to a fleet, applying checks for ownership and unit type restrictions.
   * @param asteroidEntity The identifier of the asteroid from which units and resources are transferred.
   * @param fleetEntity The identifier of the fleet to which units and resources are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(fleetEntity, unitCounts[i]);
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromAsteroidToFleet(asteroidEntity, fleetEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  /**
   * @notice Transfers units from one fleet to an asteroid, considering ownership and unit type restrictions, and ensuring cargo capacity is not exceeded.
   * @param fleetEntity The identifier of the source fleet from which units are transferred.
   * @param asteroidEntity The identifier of the asteroid to which units are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   */
  function transferUnitsFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(asteroidEntity, unitCounts[i]);
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  /**
   * @notice Transfers resources from a fleet to an asteroid.
   * @param fleetEntity The identifier of the source fleet from which resources are transferred.
   * @param asteroidEntity The identifier of the asteroid to which resources are transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferResourcesFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.increaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  /**
   * @notice Transfers both units and resources from a fleet to an asteroid, ensuring cargo capacity is not exceeded and considering ownership and unit type restrictions.
   * @param fleetEntity The identifier of the source fleet from which units and resources are transferred.
   * @param asteroidEntity The identifier of the asteroid to which units and resources are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(asteroidEntity, unitCounts[i]);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToAsteroid(fleetEntity, asteroidEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  /**
   * @notice Transfers units between two fleets, considering ownership and unit type restrictions, and ensuring cargo capacity is not exceeded.
   * @param fromFleetEntity The identifier of the source fleet from which units are transferred.
   * @param toFleetEntity The identifier of the destination fleet to which units are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   */
  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(toFleetEntity) == OwnedBy.get(fromFleetEntity);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(toFleetEntity, unitCounts[i]);
      LibFleet.increaseFleetUnit(toFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.decreaseFleetUnit(fromFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    //set to fleet to not empty
    LibFleet.checkAndSetFleetEmpty(fromFleetEntity);
    LibFleet.checkAndSetFleetEmpty(toFleetEntity);
  }

  /**
   * @notice Transfers resources between two fleets.
   * @param fromFleetEntity The identifier of the source fleet from which resources are transferred.
   * @param toFleetEntity The identifier of the destination fleet to which resources are transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibFleet.increaseFleetResource(toFleetEntity, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fromFleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  /**
   * @notice Transfers both units and resources between two fleets, applying checks for ownership and unit type restrictions, and ensuring cargo capacity is not exceeded.
   * @param fromFleetEntity The identifier of the source fleet from which units and resources are transferred.
   * @param toFleetEntity The identifier of the destination fleet to which units and resources are transferred.
   * @param unitCounts The amounts of each unit type to be transferred.
   * @param resourceCounts The amounts of each resource type to be transferred.
   */
  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 toFleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(toFleetEntity) == OwnedBy.get(fromFleetEntity);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == ColonyShipPrototypeId) checkColonySlot(toFleetEntity, unitCounts[i]);
      LibFleet.increaseFleetUnit(toFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToFleet(fromFleetEntity, toFleetEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fromFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(toFleetEntity);
    LibFleet.checkAndSetFleetEmpty(fromFleetEntity);
  }

  // make a function for checking if the receiving entity has enough Colony Slot capacity
  function checkColonySlot(bytes32 receivingEntity, uint256 colonySlotsNeeded) internal view {
    bool isAsteroid = Asteroid.getIsAsteroid(receivingEntity);
    bool isFleet = IsFleet.get(receivingEntity);
    require(isAsteroid || isFleet, "[Fleet] Receiving entity must be an asteroid or fleet");

    // if is asteroid, use OwnedBy.get(entity) to get the player entity. If is fleet, use OwnedBy.get(entity) to get the asteroid entity and then use OwnedBy.get(asteroidEntity) to get the player entity
    bytes32 playerEntity = isAsteroid ? OwnedBy.get(receivingEntity) : OwnedBy.get(OwnedBy.get(receivingEntity));

    uint256 colonySlotsOccupied = LibUnit.getColonyShipsPlusAsteroids(playerEntity);
    uint256 capacity = ColonySlots.getCapacity(playerEntity);
    require(
      capacity - colonySlotsOccupied >= colonySlotsNeeded,
      "[Fleet] Receiver not enough colony slots to transfer colony ships"
    );
  }
}
