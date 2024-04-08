import { Entity, HasValue, runQuery } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { getEntityTypeName } from "../common";
import { BuildObjective, ObjectiveReq } from "./types";

export function getHasRequiredBuilding(asteroid: Entity, objective: BuildObjective): ObjectiveReq {
  const buildings = runQuery([
    HasValue(components.OwnedBy, { value: asteroid as Hex }),
    HasValue(components.BuildingType, { value: objective.buildingType as Hex }),
  ]);

  return {
    tooltipText: `Build a ${getEntityTypeName(objective.buildingType)}`,
    backgroundImage: "/img/icons/minersicon.png",
    requiredValue: 1n,
    currentValue: BigInt(buildings.size),
    scale: 1n,
  };
}
