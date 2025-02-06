import { Hex } from "viem";

import { Core } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";

import { getObjective } from "./objectives";

export function getHasRequiredMainBase({ tables }: Core, playerEntity: Entity, objectiveEntity: Entity): boolean {
  const requirement = getObjective(objectiveEntity)?.requiredMainBase;

  if (!requirement) return true;
  const asteroidEntity = tables.Home.get(playerEntity)?.value as Entity | undefined;
  const mainBase = tables.Home.get(asteroidEntity)?.value;
  if (!mainBase) return false;

  const currentMainBaseLevel = tables.Level.getWithKeys({ entity: mainBase as Hex })?.value ?? 0n;
  return currentMainBaseLevel >= requirement;
}
