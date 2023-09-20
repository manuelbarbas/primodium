// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Level, P_EnumToPrototype, QueueItemUnitsData } from "codegen/Tables.sol";
import { LibUnit, UnitProductionQueue } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

contract TrainUnitsSystem is PrimodiumSystem {
  function trainUnits(
    bytes32 buildingEntity,
    EUnit unit,
    uint256 count
  ) public {
    IWorld world = IWorld(_world());
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    uint256 level = Level.get(buildingEntity);
    bytes32 playerEntity = addressToEntity(_msgSender());

    require(LibUnit.canProduceUnit(buildingEntity, unitPrototype), "[TrainUnitsSystem] Building cannot produce unit");

    world.updateHomeRock(playerEntity);
    world.spendRequiredResources(buildingEntity, level);

    QueueItemUnitsData memory queueItem = QueueItemUnitsData({ unitId: unitPrototype, quantity: count });

    UnitProductionQueue.enqueue(buildingEntity, queueItem);
  }
}
