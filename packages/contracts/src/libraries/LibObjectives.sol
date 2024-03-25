// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// tables
import { ProducedUnit, P_ProducedUnits, OwnedBy, UnitCount, P_RequiredExpansion, P_ProducedUnitsData, P_RequiredUnits, P_RequiredUnitsData, DestroyedUnit, P_DestroyedUnits, P_DestroyedUnitsData, P_ProducedResources, P_ProducedResourcesData, ProducedResource, RaidedResource, P_RaidedResources, P_RaidedResourcesData, P_EnumToPrototype, HasBuiltBuilding, P_HasBuiltBuildings, P_RequiredObjectives, CompletedObjective, P_RequiredBaseLevel, Level } from "codegen/index.sol";

// libraries
import { LibBuilding } from "libraries/LibBuilding.sol";

// types
import { ObjectiveKey } from "src/Keys.sol";
import { EObjectives } from "src/Types.sol";

library LibObjectives {
  function checkObjectiveRequirements(
    bytes32 playerEntity,
    bytes32 asteroidEntity,
    EObjectives objectiveType
  ) internal view {
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[LibObjectives] Player does not own the asteroid");
    checkIsValidObjective(objectiveType);

    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(objectiveType));

    checkHasNotCompletedObjective(playerEntity, objectivePrototype);
  }

  function checkIsValidObjective(EObjectives objectiveType) internal pure {
    require(
      objectiveType > EObjectives.NULL && objectiveType < EObjectives.LENGTH,
      "[LibObjectives] Invalid objective"
    );
  }

  function checkHasNotCompletedObjective(bytes32 playerEntity, bytes32 objectivePrototype) internal view {
    require(
      !CompletedObjective.get(playerEntity, objectivePrototype),
      "[LibObjectives] Player has already completed objective"
    );
  }
}
