import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { getEntityTypeName } from "../common";
import { ResourceImage } from "../constants";
import { ObjectiveReq, TrainUnitObjective } from "./types";

export function getHasRequiredUnit(asteroid: Entity, objective: TrainUnitObjective): ObjectiveReq {
  const hangar = components.Hangar.get(asteroid);
  const currentValue =
    hangar?.units.reduce((acc, unit, i) => {
      if (unit !== objective.unitType) return acc;
      return acc + hangar?.counts[i] ?? 0n;
    }, 0n) ?? 0n;

  return {
    tooltipText: `Train ${objective.unitCount} ${getEntityTypeName(objective.unitType)}${
      objective.unitCount > 1 ? "s" : ""
    }`,
    backgroundImage: ResourceImage.get(objective.unitType) ?? "",
    requiredValue: objective.unitCount,
    currentValue,
    scale: 1n,
  };
}
