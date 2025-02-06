import { Core, getEntityTypeName } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityToUnitImage } from "@/util/image";

import { ObjectiveReq, TrainUnitObjective } from "./types";

export function getHasRequiredUnit({ tables }: Core, asteroid: Entity, objective: TrainUnitObjective): ObjectiveReq {
  const hangar = tables.Hangar.get(asteroid);
  const currentValue =
    hangar?.units.reduce((acc, unit, i) => {
      if (unit !== objective.unitType) return acc;
      return acc + hangar?.counts[i] ?? 0n;
    }, 0n) ?? 0n;

  return {
    tooltipText: `Train ${objective.unitCount} ${getEntityTypeName(objective.unitType)}${
      objective.unitCount > 1 ? "s" : ""
    }`,
    backgroundImage: EntityToUnitImage[objective.unitType] ?? "",
    requiredValue: objective.unitCount,
    currentValue,
    scale: 1n,
  };
}
