// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_EnumToPrototype, QueueItemUnitsData } from "codegen/index.sol";
import { LibUnit, UnitProductionQueue } from "codegen/Libraries.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

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
    if (count == 0) {
      return;
    }
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    QueueItemUnitsData memory queueItem = QueueItemUnitsData({ unitId: unitPrototype, quantity: count });
    UnitProductionQueue.enqueue(buildingEntity, queueItem);
  }
}
