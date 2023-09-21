// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { UnitLevel, P_EnumToPrototype, QueueItemUnitsData } from "codegen/Tables.sol";
import { LibUnit, UnitProductionQueue } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

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
    IWorld world = IWorld(_world());
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    bytes32 playerEntity = addressToEntity(_msgSender());

    require(unit > EUnit.NULL && unit < EUnit.LENGTH, "[TrainUnitsSystem] Unit does not exist");
    require(LibUnit.canProduceUnit(buildingEntity, unitPrototype), "[TrainUnitsSystem] Building cannot produce unit");

    world.updateHomeRock(playerEntity);
    world.spendUnitRequiredResources(playerEntity, unitPrototype);
    if (count == 0) {
      return;
    }

    QueueItemUnitsData memory queueItem = QueueItemUnitsData({ unitId: unitPrototype, quantity: count });

    UnitProductionQueue.enqueue(buildingEntity, queueItem);
  }
}
