import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { getObjective } from "../objectives";
import { Components } from "@/lib/types";

export function getHasRequiredMainBase(components: Components, playerEntity: Entity, objectiveEntity: Entity): boolean {
  const requirement = getObjective(objectiveEntity)?.requiredMainBase;

  if (!requirement) return true;
  const asteroidEntity = components.Home.get(playerEntity)?.value as Entity | undefined;
  const mainBase = components.Home.get(asteroidEntity)?.value;
  if (!mainBase) return false;

  const currentMainBaseLevel = components.Level.getWithKeys({ entity: mainBase as Hex })?.value ?? 0n;
  return currentMainBaseLevel >= requirement;
}
