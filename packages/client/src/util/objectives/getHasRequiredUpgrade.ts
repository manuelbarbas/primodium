import { InterfaceIcons } from "@primodiumxyz/assets";
import { Core, getEntityTypeName } from "@primodiumxyz/core";
import { Entity, query } from "@primodiumxyz/reactive-tables";

import { ObjectiveReq, UpgradeObjective } from "./types";

export function getHasRequiredBuildingUpgrade(
  { tables }: Core,
  asteroid: Entity,
  objective: UpgradeObjective,
): ObjectiveReq {
  const buildings = query({
    withProperties: [
      { table: tables.OwnedBy, properties: { value: asteroid } },
      { table: tables.BuildingType, properties: { value: objective.buildingType } },
    ],
  });

  const maxLevel = [...buildings].reduce((acc, building) => {
    const level = tables.Level.getWithKeys({ entity: building })?.value ?? 0n;
    return level > acc ? level : acc;
  }, 0n);
  return {
    tooltipText: `${getEntityTypeName(objective.buildingType)} Level`,
    backgroundImage: InterfaceIcons.Add,
    requiredValue: objective.level,
    currentValue: maxLevel,
    scale: 1n,
  };
}
