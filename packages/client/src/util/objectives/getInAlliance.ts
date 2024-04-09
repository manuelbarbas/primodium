import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { ObjectiveReq } from "./types";

export function getInAlliance(asteroidEntity: Entity): ObjectiveReq {
  const playerEntity = components.OwnedBy.get(asteroidEntity)?.value as Entity | undefined;
  const inAlliance = components.PlayerAlliance.has(playerEntity);

  return {
    tooltipText: `Joined alliance`,
    backgroundImage: "/img/icons/minersicon.png",
    requiredValue: 1n,
    currentValue: inAlliance ? 1n : 0n,
    isBool: true,
    scale: 1n,
  };
}
