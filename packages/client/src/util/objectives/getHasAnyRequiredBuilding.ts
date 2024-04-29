import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "src/network/components";
import { Hex } from "viem";
import { getEntityTypeName } from "../common";
import { BuildAnyObjective, ObjectiveReq } from "./types";

export function getHasAnyRequiredBuilding(asteroid: Entity, objective: BuildAnyObjective): ObjectiveReq {
  const complete = objective.buildingTypes.some((buildingType) => {
    const buildings = runQuery([
      HasValue(components.OwnedBy, { value: asteroid as Hex }),
      HasValue(components.BuildingType, { value: buildingType as Hex }),
    ]);
    console.log(getEntityTypeName(buildingType), buildings.size);
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
