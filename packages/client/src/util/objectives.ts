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
} from "./requirements";
import { EntityID } from "@latticexyz/recs";

export function getIsObjectiveAvailable(entityID: EntityID) {
  return (
    checkMainBaseLevelRequirement(entityID) &&
    checkCompletedObjectiveRequirement(entityID)
  );
}

export function getCanClaimObjective(entityID: EntityID) {
  return (
    getIsObjectiveAvailable(entityID) &&
    checkResearcheRequirement(entityID) &&
    checkProductionRequirement(entityID) &&
    checkMaxUtilityResourceReqs(entityID) &&
    checkHasBuiltBuildingRequirement(entityID) &&
    checkBuildingCountRequirement(entityID) &&
    checkUnitRequirement(entityID) &&
    checkRaidRequirement(entityID) &&
    checkMotherlodeMinedRequirement(entityID) &&
    checkDestroyedUnitsRequirement(entityID)
  );
}
