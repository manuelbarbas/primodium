import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { getObjective } from "./objectives";

export function getHasRequiredMainBase(asteroidEntity: Entity, objectiveEntity: Entity): boolean {
  const requirement = getObjective(objectiveEntity)?.requiredMainBase;

  if (!requirement) return true;
  const mainBase = components.Home.get(asteroidEntity)?.value;
  if (!mainBase) return false;

  const currentMainBaseLevel = components.Level.getWithKeys({ entity: mainBase as Hex })?.value ?? 0n;
  return currentMainBaseLevel >= requirement;
}
