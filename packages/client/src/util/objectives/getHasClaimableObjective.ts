import { Entity } from "@primodiumxyz/reactive-tables";
import { ClaimableObjective, ObjectiveReq } from "./types";
import { Core } from "@primodiumxyz/core";

export const getHasClaimableObjective = (
  { tables }: Core,
  objectiveEntity: Entity,
  objective: ClaimableObjective
): ObjectiveReq => {
  const isClaimable = tables.IsObjectiveClaimable.get(objectiveEntity);
  return {
    tooltipText: objective.tooltip,
    backgroundImage: objective.icon,
    currentValue: isClaimable ? 1n : 0n,
    requiredValue: 1n,
    isBool: true,
    scale: 1n,
  };
};
