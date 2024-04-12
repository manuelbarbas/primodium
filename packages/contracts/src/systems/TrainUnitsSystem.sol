// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_UnitPrototypes, P_EnumToPrototype, Value_UnitProductionQueueData, OwnedBy } from "codegen/index.sol";
import { UnitProductionQueue } from "libraries/UnitProductionQueue.sol";

import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibUnit } from "libraries/LibUnit.sol";

contract TrainUnitsSystem is PrimodiumSystem {
  /// @notice Trains units based on specified unit type and count
  /// @param buildingEntity Entity identifier of the building
  /// @param unit Unit type to be trained
  /// @param count Quantity of units to be trained
  function trainUnits(bytes32 buildingEntity, EUnit unit, uint256 count) public {
    // Ensure the unit is valid (within the defined range of unit types).
    require(unit > EUnit.NULL && unit < EUnit.LENGTH, "[TrainUnitsSystem] Unit does not exist");
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    _trainUnits(buildingEntity, unitPrototype, count);
  }

  /// @notice Trains units based on specified unit prototype and count this has an inefficiency of looping through all unit prototypes
  /// @param buildingEntity Entity identifier of the building
  /// @param unitPrototype Unit prototype to be trained
  /// @param count Quantity of units to be trained
  function trainUnits(bytes32 buildingEntity, bytes32 unitPrototype, uint256 count) public {
    // Ensure the unit is valid (within the defined range of unit types).
    bool isValid = false;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) {
        isValid = true;
        break;
      }
    }
    require(isValid, "[TrainUnitsSystem] Unit does not exist");
    _trainUnits(buildingEntity, unitPrototype, count);
  }

  /// @notice Trains units based on specified unit type and count
  /// @param buildingEntity Entity identifier of the building
  /// @param unitPrototype Unit prototype to be trained
  /// @param count Quantity of units to be trained
  function _trainUnits(bytes32 buildingEntity, bytes32 unitPrototype, uint256 count) internal {
    if (count == 0) return;

    bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
    IWorld world = IWorld(_world());
    world.Primodium__claimResources(asteroidEntity);
    world.Primodium__claimUnits(asteroidEntity);
    LibResource.spendUnitRequiredResources(asteroidEntity, unitPrototype, count);
    LibUnit.checkTrainUnitsRequirements(buildingEntity, unitPrototype);

    Value_UnitProductionQueueData memory queueItem = Value_UnitProductionQueueData({
      unitEntity: unitPrototype,
      quantity: count
    });
    UnitProductionQueue.enqueue(buildingEntity, queueItem);
  }
}
