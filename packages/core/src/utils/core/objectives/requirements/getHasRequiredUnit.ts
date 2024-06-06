import { Entity } from "@latticexyz/recs";
import { ObjectiveReq, TrainUnitObjective } from "../types";
import { Components } from "@/lib/types";
import { getEntityTypeName } from "@/utils/global/common";
import { EntityToUnitImage } from "@/lib/mappings";

export function getHasRequiredUnit(
  components: Components,
  asteroid: Entity,
  objective: TrainUnitObjective
): ObjectiveReq {
  const hangar = components.Hangar.get(asteroid);
  const currentValue =
    hangar?.units.reduce((acc, unit, i) => {
      if (unit !== objective.unitType) return acc;
      return acc + (hangar?.counts[i] ?? 0n);
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
