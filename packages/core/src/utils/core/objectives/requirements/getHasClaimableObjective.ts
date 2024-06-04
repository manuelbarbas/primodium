import { Entity } from "@latticexyz/recs";
import { ClaimableObjective, ObjectiveReq } from "../types";
import { Components } from "@/types";

export const getHasClaimableObjective = (
  components: Components,
  objectiveEntity: Entity,
  objective: ClaimableObjective
): ObjectiveReq => {
  const isClaimable = components.IsObjectiveClaimable.get(objectiveEntity);
  return {
    tooltipText: objective.tooltip,
    backgroundImage: objective.icon,
    currentValue: isClaimable ? 1n : 0n,
    requiredValue: 1n,
    isBool: true,
    scale: 1n,
  };
};
