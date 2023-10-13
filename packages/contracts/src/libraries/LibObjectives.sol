// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
// tables
import { P_EnumToPrototype, HasBuiltBuilding, P_HasBuiltBuildings, P_RequiredObjectives, CompletedObjective, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_ProducesUnits, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey, ObjectiveKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource, EObjectives } from "src/Types.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

library LibObjectives {
  function checkObjectiveRequirements(bytes32 playerEntity, EObjectives objectiveType) internal {
    checkIsValidObjective(objectiveType);
    checkHasNotCompletedObjective(playerEntity, objectiveType);

    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(objectiveType));

    checkHasCompletedRequiredObjectives(playerEntity, objectivePrototype);
    checkObjectiveMainBaseLevelRequirement(playerEntity, objectivePrototype);
    checkHasBuiltRequiredBuildings(playerEntity, objectivePrototype);
  }

  function checkIsValidObjective(EObjectives objectiveType) internal pure {
    require(
      objectiveType > EObjectives.NULL && objectiveType < EObjectives.LENGTH,
      "[LibObjectives] Invalid objective"
    );
  }

  function checkHasNotCompletedObjective(bytes32 playerEntity, EObjectives objectiveType) internal {
    require(
      !CompletedObjective.get(playerEntity, uint8(objectiveType)),
      "[LibObjectives] Player has already completed objective"
    );
  }

  function checkHasCompletedRequiredObjectives(bytes32 playerEntity, bytes32 objective) internal {
    uint8[] memory requiredObjectives = P_RequiredObjectives.get(objective);
    for (uint256 i = 0; i < requiredObjectives.length; i++) {
      require(
        CompletedObjective.get(playerEntity, requiredObjectives[i]),
        "[LibObjectives] Player has not completed required objective"
      );
    }
  }

  function checkObjectiveMainBaseLevelRequirement(bytes32 playerEntity, bytes32 objective) internal {
    uint256 requiredMainBaseLevel = P_RequiredBaseLevel.get(objective, 1);
    if (requiredMainBaseLevel > 1) {
      require(
        LibBuilding.getBaseLevel(playerEntity) > requiredMainBaseLevel,
        "[LibObjectives] MainBase level requirement not met"
      );
    }
  }

  function checkHasBuiltRequiredBuildings(bytes32 playerEntity, bytes32 objective) internal {
    uint8[] memory requiredBuiltBuildings = P_HasBuiltBuildings.get(objective);
    for (uint256 i = 0; i < requiredBuiltBuildings.length; i++) {
      require(
        HasBuiltBuilding.get(playerEntity, requiredBuiltBuildings[i]),
        "[LibObjectives] Player has not built the required buildings"
      );
    }
  }
}
