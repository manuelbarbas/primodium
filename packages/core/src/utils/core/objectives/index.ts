import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { Hex } from "viem";
import { ObjectiveEntityLookup } from "@/lib/constants";
import { getHasAsteroid } from "./requirements/getHasAsteroid";
import { getHasClaimableObjective } from "./requirements/getHasClaimableObjective";
import { getHasExpansion } from "./requirements/getHasExpansion";
import { getHasRequiredBuilding } from "./requirements/getHasRequiredBuilding";
import { getHasRequiredMainBase } from "./requirements/getHasRequiredMainBase";
import { getHasRequiredObjectives } from "./requirements/getHasRequiredObjectives";
import { getHasRequiredRewards, getRewardUtilitiesRequirement } from "./requirements/getHasRequiredRewards";
import { getHasRequiredUnit } from "./requirements/getHasRequiredUnit";
import { getHasRequiredBuildingUpgrade } from "./requirements/getHasRequiredUpgrade";
import { getInAlliance } from "./requirements/getInAlliance";
import { getObjective } from "./objectives";
import { ObjectiveReq } from "./types";
import { Components } from "@/lib/types";
import { getHasAnyRequiredBuilding } from "@/utils/core/objectives/requirements/getHasAnyRequiredBuilding";
import { createResourceUtils } from "@/utils/core/resource";

export function createObjectiveUtils(components: Components) {
  const resourceUtils = createResourceUtils(components);

  function makeObjectiveClaimable(
    playerEntity: Entity,
    objective: EObjectives,
    showObjectiveCallback?: (objective: EObjectives) => void
  ) {
    const objectiveEntity = ObjectiveEntityLookup[objective];
    const hasCompletedObjective = components.CompletedObjective.getWithKeys({
      objective: objectiveEntity as Hex,
      entity: playerEntity as Hex,
    })?.value;

    const hasClaimedObjective = components.IsObjectiveClaimable.get(objectiveEntity);
    if (hasCompletedObjective || hasClaimedObjective) return;

    components.IsObjectiveClaimable.set({ value: true }, objectiveEntity);

    const objectiveShown = canShowObjective(components, playerEntity, objectiveEntity);
    if (objectiveShown) showObjectiveCallback?.(objective);
  }

  const isRequirementMet = (requirement: ObjectiveReq) =>
    !requirement || requirement.currentValue >= requirement.requiredValue;

  const isAllRequirementsMet = (requirements: ObjectiveReq[]) => !requirements || requirements.every(isRequirementMet);

  function canShowObjective(components: Components, playerEntity: Entity, objectiveEntity: Entity) {
    if (!getObjective(objectiveEntity)) return false;
    const canShow =
      getHasRequiredMainBase(components, playerEntity, objectiveEntity) &&
      getHasRequiredObjectives(components, objectiveEntity);
    return canShow;
  }

  function getCanClaimObjective(playerEntity: Entity, asteroidEntity: Entity, objectiveEntity: Entity) {
    const hasRequiredRewards = getHasRequiredRewards(components, resourceUtils, asteroidEntity, objectiveEntity);
    const allObjectiveRequirements = getAllObjectiveRequirements(playerEntity, asteroidEntity, objectiveEntity);
    return hasRequiredRewards && isAllRequirementsMet(allObjectiveRequirements);
  }

  function getAllObjectiveRequirements(playerEntity: Entity, asteroidEntity: Entity, objectiveEntity: Entity) {
    const objective = getObjective(objectiveEntity);
    if (!objective) return [];
    const reqs: ObjectiveReq[] = getRewardUtilitiesRequirement(
      components,
      resourceUtils,
      objectiveEntity,
      asteroidEntity
    );
    if (objective.type === "Build") reqs.push(getHasRequiredBuilding(components, asteroidEntity, objective));
    if (objective.type === "BuildAny") reqs.push(getHasAnyRequiredBuilding(components, asteroidEntity, objective));
    if (objective.type === "Upgrade") reqs.push(getHasRequiredBuildingUpgrade(components, asteroidEntity, objective));
    if (objective.type === "Train") reqs.push(getHasRequiredUnit(components, asteroidEntity, objective));
    if (objective.type === "Expand") reqs.push(getHasExpansion(components, asteroidEntity, objective));
    if (objective.type === "JoinAlliance") reqs.push(getInAlliance(components, asteroidEntity));
    if (objective.type === "Claim") reqs.push(getHasClaimableObjective(components, objectiveEntity, objective));
    if (objective.type === "Asteroid") reqs.push(getHasAsteroid(components, playerEntity, objective.asteroidType));
    return reqs;
  }

  return {
    makeObjectiveClaimable,
    isRequirementMet,
    isAllRequirementsMet,
    canShowObjective,
    getCanClaimObjective,
    getAllObjectiveRequirements,
  };
}
