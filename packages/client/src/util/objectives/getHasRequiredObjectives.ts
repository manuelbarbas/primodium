import { Entity } from "@primodiumxyz/reactive-tables";
import { Hex } from "viem";
import { getObjective } from "./objectives";
import { Core, ObjectiveEntityLookup } from "@primodiumxyz/core";

export function getHasRequiredObjectives({ tables }: Core, objectiveEntity: Entity): boolean {
  const requirement = getObjective(objectiveEntity)?.requiredObjectives;

  if (!requirement) return true;

  const player = tables.Account.get()?.value;
  if (!player) return false;

  return requirement.every((objective) => {
    const entity = ObjectiveEntityLookup[objective];
    return tables.CompletedObjective.getWithKeys({ entity: player as Hex, objective: entity as Hex })?.value;
  });
}
