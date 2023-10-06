import { Entity } from "@latticexyz/recs";
import {
  checkBuildingCountRequirement,
  checkCompletedObjectiveRequirement,
  checkDestroyedUnitsRequirement,
  checkHasBuiltBuildingRequirement,
  checkHasDefeatedPirateAsteroid,
  checkMainBaseLevelRequirement,
  checkMaxUtilityResourceReqs,
  checkMotherlodeMinedRequirement,
  checkProductionRequirement,
  checkRaidRequirement,
  checkResearcheRequirement,
  checkUnitRequirement,
  getAllRequirements,
} from "./requirements";
import { getRecipe, hasEnoughResources } from "./resource";

export function getIsObjectiveAvailable(entity: Entity) {
  return (
    getAllRequirements(entity).length === 0 ||
    (checkMainBaseLevelRequirement(entity) && checkCompletedObjectiveRequirement(entity))
  );
}

export function getCanClaimObjective(entity: Entity) {
  return (
    checkMainBaseLevelRequirement(entity) &&
    checkCompletedObjectiveRequirement(entity) &&
    hasEnoughResources(getRecipe(entity), 1) &&
    checkResearcheRequirement(entity) &&
    checkProductionRequirement(entity) &&
    checkMaxUtilityResourceReqs(entity) &&
    checkHasBuiltBuildingRequirement(entity) &&
    checkBuildingCountRequirement(entity) &&
    checkUnitRequirement(entity) &&
    checkRaidRequirement(entity) &&
    checkMotherlodeMinedRequirement(entity) &&
    checkDestroyedUnitsRequirement(entity) &&
    checkHasDefeatedPirateAsteroid(entity)
  );
}
