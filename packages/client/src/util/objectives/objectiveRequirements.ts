import { Entity } from "@latticexyz/recs";
import { getHasRequiredBuilding } from "./getHasRequiredBuilding";
import { getHasRequiredMainBase } from "./getHasRequiredMainBase";
import { getHasRequiredObjectives } from "./getHasRequiredObjectives";
import { getHasRequiredRewards, getRewardUtilitiesRequirement } from "./getHasRequiredRewards";
import { getObjective } from "./objectives";
import { ObjectiveReq } from "./types";

export const isRequirementMet = (requirement: ObjectiveReq) =>
  !requirement || requirement.currentValue >= requirement.requiredValue;

export const isAllRequirementsMet = (requirements: ObjectiveReq[]) =>
  !requirements || requirements.every(isRequirementMet);

export function canShowObjective(playerEntity: Entity, objectiveEntity: Entity) {
  if (!getObjective(objectiveEntity)) return false;
  return getHasRequiredMainBase(playerEntity, objectiveEntity) && getHasRequiredObjectives(objectiveEntity);
}

export function getCanClaimObjective(asteroidEntity: Entity, objectiveEntity: Entity) {
  const hasRequiredRewards = getHasRequiredRewards(asteroidEntity, objectiveEntity);
  return hasRequiredRewards && isObjectiveComplete(asteroidEntity, objectiveEntity);
}

export function isObjectiveComplete(asteroidEntity: Entity, objectiveEntity: Entity) {
  const allObjectiveRequirements = getAllObjectiveRequirements(asteroidEntity, objectiveEntity);
  return isAllRequirementsMet(allObjectiveRequirements);
}

export function getAllObjectiveRequirements(asteroidEntity: Entity, objectiveEntity: Entity) {
  const objective = getObjective(objectiveEntity);
  if (!objective) return [];
  const reqs: ObjectiveReq[] = getRewardUtilitiesRequirement(objectiveEntity, asteroidEntity);
  if (objective.type === "Build") reqs.push(getHasRequiredBuilding(asteroidEntity, objective));
  return reqs;
}
