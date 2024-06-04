import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { ObjectiveReq } from "../types";
import { Components } from "@/lib/types";

export function getInAlliance(components: Components, asteroidEntity: Entity): ObjectiveReq {
  const playerEntity = components.OwnedBy.get(asteroidEntity)?.value as Entity | undefined;
  const inAlliance = components.PlayerAlliance.has(playerEntity);

  return {
    tooltipText: `Joined alliance`,
    backgroundImage: InterfaceIcons.Add,
    requiredValue: 1n,
    currentValue: inAlliance ? 1n : 0n,
    isBool: true,
    scale: 1n,
  };
}
