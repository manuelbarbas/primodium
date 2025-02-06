import { Hex } from "viem";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { Core } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";

import { ExpandObjective, ObjectiveReq } from "./types";

export function getHasExpansion({ tables }: Core, asteroid: Entity, objective: ExpandObjective): ObjectiveReq {
  const level = tables.Level.getWithKeys({ entity: asteroid as Hex })?.value ?? 0n;

  return {
    tooltipText: `Expand to Lvl ${objective.level}`,
    backgroundImage: InterfaceIcons.Build,
    requiredValue: objective.level,
    currentValue: level,
    scale: 1n,
  };
}
