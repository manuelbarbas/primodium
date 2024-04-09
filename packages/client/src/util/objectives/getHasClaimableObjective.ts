import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { ClaimableObjective } from "./types";

export const getHasClaimableObjective = (objectiveEntity: Entity, objective: ClaimableObjective) => {
  const isClaimable = components.IsObjectiveClaimable.get(objectiveEntity);
  return {
    tooltipText: objective.tooltip,
    backgroundImage: objective.icon,
    currentValue: isClaimable ? 1n : 0n,
    requiredValue: 1n,
    isBoolean: true,
    scale: 1n,
  };
};
