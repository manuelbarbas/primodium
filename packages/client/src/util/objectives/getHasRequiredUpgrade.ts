import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "src/network/components";
import { Hex } from "viem";
import { getEntityTypeName } from "../common";
import { ObjectiveReq, UpgradeObjective } from "./types";

export function getHasRequiredBuildingUpgrade(asteroid: Entity, objective: UpgradeObjective): ObjectiveReq {
  const buildings = runQuery([
    HasValue(components.OwnedBy, { value: asteroid as Hex }),
    HasValue(components.BuildingType, { value: objective.buildingType as Hex }),
  ]);

  const maxLevel = [...buildings].reduce((acc, building) => {
    const level = components.Level.getWithKeys({ entity: building as Hex })?.value ?? 0n;
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
