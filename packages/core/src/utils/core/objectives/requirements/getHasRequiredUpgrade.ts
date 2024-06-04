import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Hex } from "viem";
import { ObjectiveReq, UpgradeObjective } from "../types";
import { getEntityTypeName } from "@/utils/global/common";
import { Components } from "@/types";

export function getHasRequiredBuildingUpgrade(
  components: Components,
  asteroid: Entity,
  objective: UpgradeObjective
): ObjectiveReq {
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
