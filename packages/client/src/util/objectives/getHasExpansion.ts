import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { ExpandObjective, ObjectiveReq } from "./types";

export function getHasExpansion(asteroid: Entity, objective: ExpandObjective): ObjectiveReq {
  const level = components.Level.getWithKeys({ entity: asteroid as Hex })?.value ?? 0n;

  return {
    tooltipText: `Expand to Lvl ${objective.level}`,
    backgroundImage: "/img/icons/minersicon.png",
    requiredValue: objective.level,
    currentValue: level,
    scale: 1n,
  };
}
