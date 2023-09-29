import {
  checkMainBaseLevelRequirement,
  checkCompletedObjectiveRequirement,
  checkResearcheRequirement,
  checkProductionRequirement,
  checkMaxUtilityResourceReqs,
  checkHasBuiltBuildingRequirement,
  checkBuildingCountRequirement,
  checkUnitRequirement,
  checkRaidRequirement,
  checkMotherlodeMinedRequirement,
  checkDestroyedUnitsRequirement,
  checkHasDefeatedPirateAsteroid,
  getAllRequirements,
} from "./requirements";
import { EntityID } from "@latticexyz/recs";
import { getRecipe, hasEnoughResources } from "./resource";

export function getIsObjectiveAvailable(entityID: EntityID) {
  return (
    getAllRequirements(entityID).length === 0 ||
    (checkMainBaseLevelRequirement(entityID) &&
      checkCompletedObjectiveRequirement(entityID))
  );
}

export function getCanClaimObjective(entityID: EntityID) {
  return (
    checkMainBaseLevelRequirement(entityID) &&
    checkCompletedObjectiveRequirement(entityID) &&
    hasEnoughResources(getRecipe(entityID), 1) &&
    checkResearcheRequirement(entityID) &&
    checkProductionRequirement(entityID) &&
    checkMaxUtilityResourceReqs(entityID) &&
    checkHasBuiltBuildingRequirement(entityID) &&
    checkBuildingCountRequirement(entityID) &&
    checkUnitRequirement(entityID) &&
    checkRaidRequirement(entityID) &&
    checkMotherlodeMinedRequirement(entityID) &&
    checkDestroyedUnitsRequirement(entityID) &&
    checkHasDefeatedPirateAsteroid(entityID)
  );
}
