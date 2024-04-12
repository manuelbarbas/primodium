import { Entity } from "@latticexyz/recs";
import { getHasAsteroid } from "./getHasAsteroid";
import { getHasClaimableObjective } from "./getHasClaimableObjective";
import { getHasExpansion } from "./getHasExpansion";
import { getHasRequiredBuilding } from "./getHasRequiredBuilding";
import { getHasRequiredMainBase } from "./getHasRequiredMainBase";
import { getHasRequiredObjectives } from "./getHasRequiredObjectives";
import { getHasRequiredRewards, getRewardUtilitiesRequirement } from "./getHasRequiredRewards";
import { getHasRequiredUnit } from "./getHasRequiredUnit";
import { getHasRequiredBuildingUpgrade } from "./getHasRequiredUpgrade";
import { getInAlliance } from "./getInAlliance";
import { getObjective } from "./objectives";
import { ObjectiveReq } from "./types";

export const isRequirementMet = (requirement: ObjectiveReq) =>
  !requirement || requirement.currentValue >= requirement.requiredValue;

export const isAllRequirementsMet = (requirements: ObjectiveReq[]) =>
  !requirements || requirements.every(isRequirementMet);

export function canShowObjective(playerEntity: Entity, objectiveEntity: Entity) {
  if (!getObjective(objectiveEntity)) return false;
  const canShow = getHasRequiredMainBase(playerEntity, objectiveEntity) && getHasRequiredObjectives(objectiveEntity);
  return canShow;
}

export function getCanClaimObjective(playerEntity: Entity, asteroidEntity: Entity, objectiveEntity: Entity) {
  const hasRequiredRewards = getHasRequiredRewards(asteroidEntity, objectiveEntity);
  const allObjectiveRequirements = getAllObjectiveRequirements(playerEntity, asteroidEntity, objectiveEntity);
  return hasRequiredRewards && isAllRequirementsMet(allObjectiveRequirements);
}

export function getAllObjectiveRequirements(playerEntity: Entity, asteroidEntity: Entity, objectiveEntity: Entity) {
  const objective = getObjective(objectiveEntity);
  if (!objective) return [];
  const reqs: ObjectiveReq[] = getRewardUtilitiesRequirement(objectiveEntity, asteroidEntity);
  if (objective.type === "Build") reqs.push(getHasRequiredBuilding(asteroidEntity, objective));
  if (objective.type === "Upgrade") reqs.push(getHasRequiredBuildingUpgrade(asteroidEntity, objective));
  if (objective.type === "Train") reqs.push(getHasRequiredUnit(asteroidEntity, objective));
  if (objective.type === "Expand") reqs.push(getHasExpansion(asteroidEntity, objective));
  if (objective.type === "JoinAlliance") reqs.push(getInAlliance(asteroidEntity));
  if (objective.type === "Claim") reqs.push(getHasClaimableObjective(objectiveEntity, objective));
  if (objective.type === "Asteroid") reqs.push(getHasAsteroid(playerEntity, objective.asteroidType));
  return reqs;
}
