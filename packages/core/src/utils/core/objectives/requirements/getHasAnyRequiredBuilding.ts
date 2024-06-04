import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Hex } from "viem";
import { BuildAnyObjective, ObjectiveReq } from "../types";
import { Components } from "@/types";
import { getEntityTypeName } from "@/utils/global/common";

export function getHasAnyRequiredBuilding(
  components: Components,
  asteroid: Entity,
  objective: BuildAnyObjective
): ObjectiveReq {
  const complete = objective.buildingTypes.some((buildingType) => {
    const buildings = runQuery([
      HasValue(components.OwnedBy, { value: asteroid as Hex }),
      HasValue(components.BuildingType, { value: buildingType as Hex }),
    ]);
    return buildings.size > 0;
  });

  const message = objective.buildingTypes
    .map(
      (buildingType, i) => `${getEntityTypeName(buildingType)}  ${i == objective.buildingTypes.length - 1 ? "or " : ""}`
    )
    .join(", ");
  return {
    tooltipText: `Build a ${message}`,
    backgroundImage: InterfaceIcons.Build,
    requiredValue: 1n,
    currentValue: complete ? 1n : 0n,
    isBool: true,
    scale: 1n,
  };
}
