import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { BuildObjective, ObjectiveReq } from "./types";

export function getHasRequiredBuilding(asteroid: Entity, objective: BuildObjective): ObjectiveReq {
  const buildings = runQuery([
    HasValue(components.OwnedBy, { value: asteroid as Hex }),
    HasValue(components.BuildingType, { value: objective.buildingType as Hex }),
  ]);

  const maxLevel = !![...buildings].find((building) => {
    const level = components.Level.get(building as Entity)?.value ?? 0n;
    return level >= objective.level;
  });

  return {
    type: "Building",
    requiredValue: objective.level,
    currentValue: maxLevel ? objective.level : 0n,
    scale: 1n,
  };
}
