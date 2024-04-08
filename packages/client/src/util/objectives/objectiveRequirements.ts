import { Entity } from "@latticexyz/recs";
import { getHasRequiredBuilding } from "./getHasRequiredBuilding";
import { getHasRequiredMainBase } from "./getHasRequiredMainBase";
import { getHasRequiredObjectives } from "./getHasRequiredObjectives";
import { getHasRequiredRewards } from "./getHasRequiredRewards";
import { getHasRequiredBuildingUpgrade } from "./getHasRequiredUpgrade";
import { getObjective } from "./objectives";
import { ObjectiveReq } from "./types";

export const isRequirementMet = (requirement: ObjectiveReq) =>
  !requirement || requirement.currentValue >= requirement.requiredValue;

export const isAllRequirementsMet = (requirements: ObjectiveReq[]) =>
  !requirements || requirements.every(isRequirementMet);

export function canShowObjective(asteroidEntity: Entity, objectiveEntity: Entity) {
  if (!getObjective(objectiveEntity)) return false;
  const canShow = getHasRequiredMainBase(asteroidEntity, objectiveEntity) && getHasRequiredObjectives(objectiveEntity);
  return canShow;
}

export function getCanClaimObjective(asteroidEntity: Entity, objectiveEntity: Entity) {
  const hasRequiredRewards = getHasRequiredRewards(asteroidEntity, objectiveEntity);
  const allObjectiveRequirements = getAllObjectiveRequirements(asteroidEntity, objectiveEntity);
  return hasRequiredRewards && isAllRequirementsMet(allObjectiveRequirements);
}

export function getAllObjectiveRequirements(asteroidEntity: Entity, objectiveEntity: Entity) {
  const objective = getObjective(objectiveEntity);
  if (!objective) return [];
  const reqs: ObjectiveReq[] = [];
  if (objective.type === "Build") reqs.push(getHasRequiredBuilding(asteroidEntity, objective));
  if (objective.type === "Upgrade") reqs.push(getHasRequiredBuildingUpgrade(asteroidEntity, objective));
  return reqs;
}
