import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Hex } from "viem";
import { ExpandObjective, ObjectiveReq } from "../types";
import { Components } from "@/lib/types";

export function getHasExpansion(components: Components, asteroid: Entity, objective: ExpandObjective): ObjectiveReq {
  const level = components.Level.getWithKeys({ entity: asteroid as Hex })?.value ?? 0n;

  return {
    tooltipText: `Expand to Lvl ${objective.level}`,
    backgroundImage: InterfaceIcons.Build,
    requiredValue: objective.level,
    currentValue: level,
    scale: 1n,
  };
}
