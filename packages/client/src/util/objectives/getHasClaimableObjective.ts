import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";

export const getHasClaimableObjective = (objectiveEntity: Entity) => {
  const isClaimable = components.IsObjectiveClaimable.get(objectiveEntity);
  return {
    tooltipText: "Completed Objective",
    currentValue: isClaimable ? 1n : 0n,
    requiredValue: 1n,
    isBoolean: true,
    scale: 1n,
  };
};
