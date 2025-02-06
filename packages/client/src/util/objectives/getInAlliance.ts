import { InterfaceIcons } from "@primodiumxyz/assets";
import { Core } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";

import { ObjectiveReq } from "./types";

export function getInAlliance({ tables }: Core, asteroidEntity: Entity): ObjectiveReq {
  const playerEntity = tables.OwnedBy.get(asteroidEntity)?.value as Entity | undefined;
  const inAlliance = tables.PlayerAlliance.has(playerEntity);

  return {
    tooltipText: `Joined alliance`,
    backgroundImage: InterfaceIcons.Add,
    requiredValue: 1n,
    currentValue: inAlliance ? 1n : 0n,
    isBool: true,
    scale: 1n,
  };
}
