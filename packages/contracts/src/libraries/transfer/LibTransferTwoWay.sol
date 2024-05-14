// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { P_Transportables, P_UnitPrototypes, IsFleet } from "codegen/index.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibTransfer } from "libraries/transfer/LibTransfer.sol";

/**
 * @title LibTransferTwoWay
 * @dev Library for transferring units and resources between fleets and asteroids, including validations for ownership and capacity.
 */
library LibTransferTwoWay {
  /**
   * @notice Checks cargo capacity and sets fleet to empty if applicable
   * @param entity The entity to check
   * @param isFleet Boolean indicating if the entity is a fleet
   */
  function _checkCargoAndEmpty(bytes32 entity, bool isFleet) private {
    if (isFleet) {
      require(
        LibCombatAttributes.getCargoCapacity(entity) >= LibCombatAttributes.getCargo(entity),
        "[TransferTwoWay] Not enough cargo space"
      );
      LibFleet.checkAndSetFleetEmpty(entity);
    }
  }

  /**
   * @notice Transfers units between entities
   * @param entity The entity to transfer units to/from
   * @param prototypeId The prototype ID of the unit
   * @param count The number of units to transfer
   * @param isFleet Boolean indicating if the entity is a fleet
   * @param increase Boolean indicating if the transfer is an increase
   * @param diffAsteroidOwner Boolean indicating if the transfer is between different asteroid owners
   */
  function _transferUnit(
    bytes32 entity,
    bytes32 prototypeId,
    uint256 count,
    bool isFleet,
    bool increase,
    bool diffAsteroidOwner
  ) private {
    if (isFleet) {
      if (increase) LibFleet.increaseFleetUnit(entity, prototypeId, count, diffAsteroidOwner);
      else LibFleet.decreaseFleetUnit(entity, prototypeId, count, diffAsteroidOwner);
    } else {
      if (increase) LibUnit.increaseUnitCount(entity, prototypeId, count, diffAsteroidOwner);
      else LibUnit.decreaseUnitCount(entity, prototypeId, count, diffAsteroidOwner);
    }
  }

  /**
   * @notice Transfers resources between entities
   * @param entity The entity to transfer resources to/from
   * @param resourceId The ID of the resource
   * @param count The amount of resources to transfer
   * @param isFleet Boolean indicating if the entity is a fleet
   * @param increase Boolean indicating if the transfer is an increase
   * @dev The increase is unchecked to avoid utility overflow. It is cross-checked with cargo capacity in _checkCargoAndEmpty
   */
  function _transferResource(bytes32 entity, uint8 resourceId, uint256 count, bool isFleet, bool increase) private {
    if (isFleet) {
      if (increase) LibFleet.uncheckedIncreaseFleetResource(entity, resourceId, count);
      else LibFleet.decreaseFleetResource(entity, resourceId, count);
    } else {
      if (increase) LibStorage.increaseStoredResource(entity, resourceId, count);
      else LibStorage.decreaseStoredResource(entity, resourceId, count);
    }
  }

  /**
   * @notice Transfers units between entities that have the same owning asteroid
   * @param fromEntity The entity to transfer units from
   * @param toEntity The entity to transfer units to
   * @param unitCounts The counts of units to transfer
   * @param fromIsFleet Boolean indicating if the fromEntity is a fleet
   * @param toIsFleet Boolean indicating if the toEntity is a fleet
   */
  function _transferUnitsSameAsteroidOwner(
    bytes32 fromEntity,
    bytes32 toEntity,
    int256[] memory unitCounts,
    bool fromIsFleet,
    bool toIsFleet
  ) private {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;

      bool leftToRight = unitCounts[i] > 0;
      uint256 count = uint256(leftToRight ? unitCounts[i] : -unitCounts[i]);

      if (unitPrototypes[i] == ColonyShipPrototypeId) {
        LibTransfer.checkColonySlot(leftToRight ? toEntity : fromEntity, count);
      }

      _transferUnit(fromEntity, unitPrototypes[i], count, fromIsFleet, !leftToRight, false);
      _transferUnit(toEntity, unitPrototypes[i], count, toIsFleet, leftToRight, false);
    }
  }

  /**
   * @notice Transfers units between entities with different asteroid owners
   * @dev To avoid utility overflow, units are subtracted first and then added
   * @param fromEntity The entity to transfer units from
   * @param toEntity The entity to transfer units to
   * @param unitCounts The counts of units to transfer
   * @param fromIsFleet Boolean indicating if the fromEntity is a fleet
   * @param toIsFleet Boolean indicating if the toEntity is a fleet
   */
  function _transferUnitsDiffAsteroidOwner(
    bytes32 fromEntity,
    bytes32 toEntity,
    int256[] memory unitCounts,
    bool fromIsFleet,
    bool toIsFleet
  ) private {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    // only subtract units
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;

      bool leftToRight = unitCounts[i] > 0;
      uint256 count = uint256(leftToRight ? unitCounts[i] : -unitCounts[i]);

      if (unitPrototypes[i] == ColonyShipPrototypeId) {
        LibTransfer.checkColonySlot(leftToRight ? toEntity : fromEntity, count);
      }

      if (leftToRight) _transferUnit(fromEntity, unitPrototypes[i], count, fromIsFleet, false, true);
      else _transferUnit(toEntity, unitPrototypes[i], count, toIsFleet, false, true);
    }

    // only add units
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;

      bool leftToRight = unitCounts[i] > 0;
      uint256 count = uint256(leftToRight ? unitCounts[i] : -unitCounts[i]);

      if (!leftToRight) _transferUnit(fromEntity, unitPrototypes[i], count, fromIsFleet, true, true);
      else _transferUnit(toEntity, unitPrototypes[i], count, toIsFleet, true, true);
    }
  }

  /**
   * @notice Transfers resources between entities
   * @param fromEntity The entity to transfer resources from
   * @param toEntity The entity to transfer resources to
   * @param resourceCounts The counts of resources to transfer
   * @param fromIsFleet Boolean indicating if the fromEntity is a fleet
   * @param toIsFleet Boolean indicating if the toEntity is a fleet
   */
  function _transferResources(
    bytes32 fromEntity,
    bytes32 toEntity,
    int256[] memory resourceCounts,
    bool fromIsFleet,
    bool toIsFleet
  ) private {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;

      bool leftToRight = resourceCounts[i] > 0;
      uint256 count = uint256(leftToRight ? resourceCounts[i] : -resourceCounts[i]);

      _transferResource(fromEntity, transportables[i], count, fromIsFleet, !leftToRight);
      _transferResource(toEntity, transportables[i], count, toIsFleet, leftToRight);
    }
  }

  /**
   * @notice Transfers units between two entities
   * @param leftEntity The first entity
   * @param rightEntity The second entity
   * @param unitCounts The counts of units to transfer
   * @param sameAsteroidOwner Boolean indicating if the entities have the same owner
   */
  function transferUnitsTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] memory unitCounts,
    bool sameAsteroidOwner
  ) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);

    if (sameAsteroidOwner)
      _transferUnitsSameAsteroidOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    else _transferUnitsDiffAsteroidOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }

  /**
   * @notice Transfers resources between two entities
   * @param leftEntity The first entity
   * @param rightEntity The second entity
   * @param resourceCounts The counts of resources to transfer
   */
  function transferResourcesTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] memory resourceCounts) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);
    _transferResources(leftEntity, rightEntity, resourceCounts, leftIsFleet, rightIsFleet);

    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }

  /**
   * @notice Transfers units and resources between two entities
   * @param leftEntity The first entity
   * @param rightEntity The second entity
   * @param unitCounts The counts of units to transfer
   * @param resourceCounts The counts of resources to transfer
   * @param sameAsteroidOwner Boolean indicating if the entities have the same owner
   */
  function transferUnitsAndResourcesTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] memory unitCounts,
    int256[] memory resourceCounts,
    bool sameAsteroidOwner
  ) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);
    if (sameAsteroidOwner)
      _transferUnitsSameAsteroidOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    else _transferUnitsDiffAsteroidOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);

    _transferResources(leftEntity, rightEntity, resourceCounts, leftIsFleet, rightIsFleet);
    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }
}
