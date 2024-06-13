import { getHasAnyRequiredBuilding } from "@/util/objectives/getHasAnyRequiredBuilding";
import { Entity } from "@primodiumxyz/reactive-tables";
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
import { Core } from "@primodiumxyz/core";

export const isRequirementMet = (requirement: ObjectiveReq) =>
  !requirement || requirement.currentValue >= requirement.requiredValue;

export const isAllRequirementsMet = (requirements: ObjectiveReq[]) =>
  !requirements || requirements.every(isRequirementMet);

export function canShowObjective(core: Core, playerEntity: Entity, objectiveEntity: Entity) {
  if (!getObjective(objectiveEntity)) return false;
  const canShow =
    getHasRequiredMainBase(core, playerEntity, objectiveEntity) && getHasRequiredObjectives(core, objectiveEntity);
  return canShow;
}

export function getCanClaimObjective(
  core: Core,
  playerEntity: Entity,
  asteroidEntity: Entity,
  objectiveEntity: Entity
): boolean {
  const hasRequiredRewards = getHasRequiredRewards(core, asteroidEntity, objectiveEntity);
  const allObjectiveRequirements = getAllObjectiveRequirements(core, playerEntity, asteroidEntity, objectiveEntity);
  return hasRequiredRewards && isAllRequirementsMet(allObjectiveRequirements);
}

export function getAllObjectiveRequirements(
  core: Core,
  playerEntity: Entity,
  asteroidEntity: Entity,
  objectiveEntity: Entity
): ObjectiveReq[] {
  const objective = getObjective(objectiveEntity);
  if (!objective) return [];
  const reqs: ObjectiveReq[] = getRewardUtilitiesRequirement(core, objectiveEntity, asteroidEntity);
  if (objective.type === "Build") reqs.push(getHasRequiredBuilding(core, asteroidEntity, objective));
  if (objective.type === "BuildAny") reqs.push(getHasAnyRequiredBuilding(core, asteroidEntity, objective));
  if (objective.type === "Upgrade") reqs.push(getHasRequiredBuildingUpgrade(core, asteroidEntity, objective));
  if (objective.type === "Train") reqs.push(getHasRequiredUnit(core, asteroidEntity, objective));
  if (objective.type === "Expand") reqs.push(getHasExpansion(core, asteroidEntity, objective));
  if (objective.type === "JoinAlliance") reqs.push(getInAlliance(core, asteroidEntity));
  if (objective.type === "Claim") reqs.push(getHasClaimableObjective(core, objectiveEntity, objective));
  if (objective.type === "Asteroid") reqs.push(getHasAsteroid(core, playerEntity, objective.asteroidType));
  return reqs;
}
