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
  function _checkCargoAndEmpty(bytes32 entity, bool isFleet) private {
    if (isFleet) {
      require(
        LibCombatAttributes.getCargoCapacity(entity) >= LibCombatAttributes.getCargo(entity),
        "[TransferTwoWay] Not enough cargo space"
      );
      LibFleet.checkAndSetFleetEmpty(entity);
    }
  }

  function _transferUnit(
    bytes32 entity,
    bytes32 prototypeId,
    uint256 count,
    bool isFleet,
    bool increase,
    bool diffOwner
  ) private {
    if (isFleet) {
      if (increase) LibFleet.increaseFleetUnit(entity, prototypeId, count, diffOwner);
      else LibFleet.decreaseFleetUnit(entity, prototypeId, count, diffOwner);
    } else {
      if (increase) LibUnit.increaseUnitCount(entity, prototypeId, count, diffOwner);
      else LibUnit.decreaseUnitCount(entity, prototypeId, count, diffOwner);
    }
  }

  function _transferResource(bytes32 entity, uint8 resourceId, uint256 count, bool isFleet, bool increase) private {
    if (isFleet) {
      if (increase) LibFleet.uncheckedIncreaseFleetResource(entity, resourceId, count);
      else LibFleet.decreaseFleetResource(entity, resourceId, count);
    } else {
      if (increase) LibStorage.increaseStoredResource(entity, resourceId, count);
      else LibStorage.decreaseStoredResource(entity, resourceId, count);
    }
  }

  function _transferUnitsSameOwner(
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
   * @notice  transfers units between different owners
   * @dev     to avoid utility overflow, we subtract units first and then add units
   */
  function _transferUnitsDiffOwner(
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

  function transferUnitsTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] memory unitCounts,
    bool sameOwner
  ) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);

    if (sameOwner) _transferUnitsSameOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    else _transferUnitsDiffOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }

  function transferResourcesTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] memory resourceCounts) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);
    _transferResources(leftEntity, rightEntity, resourceCounts, leftIsFleet, rightIsFleet);
    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }

  function transferUnitsAndResourcesTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] memory unitCounts,
    int256[] memory resourceCounts,
    bool sameOwner
  ) internal {
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);
    if (sameOwner) _transferUnitsSameOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);
    else _transferUnitsDiffOwner(leftEntity, rightEntity, unitCounts, leftIsFleet, rightIsFleet);

    _transferResources(leftEntity, rightEntity, resourceCounts, leftIsFleet, rightIsFleet);
    _checkCargoAndEmpty(leftEntity, leftIsFleet);
    _checkCargoAndEmpty(rightEntity, rightIsFleet);
  }
}
