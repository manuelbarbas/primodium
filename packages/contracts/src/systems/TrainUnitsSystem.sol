// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_EnumToPrototype, QueueItemUnitsData, Position } from "codegen/index.sol";
import { UnitProductionQueue } from "codegen/Libraries.sol";

import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";
import { claimResources, claimUnits } from "libraries/SubsystemCalls.sol";
import { LibResource } from "codegen/Libraries.sol";
import { LibUnit } from "codegen/Libraries.sol";

contract TrainUnitsSystem is PrimodiumSystem {
  /// @notice Trains units based on specified unit type and count
  /// @param buildingEntity Entity identifier of the building
  /// @param unit Unit type to be trained
  /// @param count Quantity of units to be trained
  function trainUnits(
    bytes32 buildingEntity,
    EUnit unit,
    uint256 count
  ) public {
    if (count == 0) return;
    // Ensure the unit is valid (within the defined range of unit types).
    require(unit > EUnit.NULL && unit < EUnit.LENGTH, "[TrainUnitsSystem] Unit does not exist");

    bytes32 spaceRockEntity = Position.getParent(buildingEntity);
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));

    claimResources(spaceRockEntity);
    claimUnits(spaceRockEntity);
    LibResource.spendUnitRequiredResources(spaceRockEntity, unitPrototype, count);
    LibUnit.checkTrainUnitsRequirements(buildingEntity, unitPrototype);

    QueueItemUnitsData memory queueItem = QueueItemUnitsData({ unitId: unitPrototype, quantity: count });
    UnitProductionQueue.enqueue(buildingEntity, queueItem);
  }
}
