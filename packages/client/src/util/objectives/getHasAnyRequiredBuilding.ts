import { InterfaceIcons } from "@primodiumxyz/assets";
import { BuildAnyObjective, ObjectiveReq } from "./types";
import { Entity, query } from "@primodiumxyz/reactive-tables";
import { Core, getEntityTypeName } from "@primodiumxyz/core";

export function getHasAnyRequiredBuilding(
  { tables }: Core,
  asteroid: Entity,
  objective: BuildAnyObjective
): ObjectiveReq {
  const complete = objective.buildingTypes.some((buildingType) => {
    const buildings = query({
      withProperties: [
        { table: tables.OwnedBy, properties: { value: asteroid } },
        { table: tables.BuildingType, properties: { value: buildingType } },
      ],
    });
    return buildings.length > 0;
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
