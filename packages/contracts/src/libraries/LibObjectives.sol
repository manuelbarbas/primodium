// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
// tables
import { DefeatedPirate, P_DefeatedPirates, P_RequiredUnits, P_RequiredUnitsData, DestroyedUnit, P_DestroyedUnits, P_DestroyedUnitsData, P_ProducedResources, P_ProducedResourcesData, ProducedResource, RaidedResource, P_RaidedResources, P_RaidedResourcesData, P_EnumToPrototype, HasBuiltBuilding, P_HasBuiltBuildings, P_RequiredObjectives, CompletedObjective, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_ProducesUnits, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

// types
import { UnitKey, BuildingKey, BuildingTileKey, ExpansionKey, ObjectiveKey } from "src/Keys.sol";
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
    checkProducedResources(playerEntity, objectivePrototype);
    checkRaidedResources(playerEntity, objectivePrototype);
    checkDestroyedUnits(playerEntity, objectivePrototype);
    checkHasRequiredUnits(playerEntity, objectivePrototype);
    checkDefeatedPirateAsteroidRequirement(playerEntity, objectivePrototype);
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

  function checkProducedResources(bytes32 playerEntity, bytes32 objective) internal {
    P_ProducedResourcesData memory producedResources = P_ProducedResources.get(objective);
    for (uint256 i = 0; i < producedResources.resources.length; i++) {
      require(
        ProducedResource.get(playerEntity, producedResources.resources[i]) >= producedResources.amounts[i],
        "[LibObjectives] Player has not produced the required resources"
      );
    }
  }

  function checkRaidedResources(bytes32 playerEntity, bytes32 objective) internal {
    P_RaidedResourcesData memory raidedResources = P_RaidedResources.get(objective);
    for (uint256 i = 0; i < raidedResources.resources.length; i++) {
      require(
        RaidedResource.get(playerEntity, raidedResources.resources[i]) >= raidedResources.amounts[i],
        "[LibObjectives] Player has not raided the required resources"
      );
    }
  }

  function checkDestroyedUnits(bytes32 playerEntity, bytes32 objective) internal {
    P_DestroyedUnitsData memory destroyedUnits = P_DestroyedUnits.get(objective);
    for (uint256 i = 0; i < destroyedUnits.units.length; i++) {
      require(
        DestroyedUnit.get(playerEntity, destroyedUnits.units[i]) >= destroyedUnits.amounts[i],
        "[LibObjectives] Player has not destroyed the required units"
      );
    }
  }

  function checkHasRequiredUnits(bytes32 playerEntity, bytes32 objective) internal {
    P_RequiredUnitsData memory requiredUnits = P_RequiredUnits.get(objective);
    for (uint256 i = 0; i < requiredUnits.units.length; i++) {
      require(
        LibUnit.getUnitCountOnHomeAsteroid(playerEntity, P_EnumToPrototype.get(UnitKey, requiredUnits.units[i])) >=
          requiredUnits.amounts[i],
        "[LibObjectives] Player does not have the required units"
      );
    }
  }

  function checkDefeatedPirateAsteroidRequirement(bytes32 playerEntity, bytes32 objective) internal {
    uint8[] memory requiredDefeatedPirates = P_DefeatedPirates.get(objective);
    for (uint256 i = 0; i < requiredDefeatedPirates.length; i++) {
      require(
        DefeatedPirate.get(playerEntity, requiredDefeatedPirates[i]),
        "[LibObjectives] Player has not defeated the required pirates"
      );
    }
  }
}
