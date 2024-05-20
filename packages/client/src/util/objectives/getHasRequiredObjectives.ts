import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { ObjectiveEntityLookup } from "../constants";
import { getObjective } from "./objectives";

export function getHasRequiredObjectives(objectiveEntity: Entity): boolean {
  const requirement = getObjective(objectiveEntity)?.requiredObjectives;

  if (!requirement) return true;

  const player = components.Account.get()?.value;
  if (!player) return false;

  return requirement.every((objective) => {
    const entity = ObjectiveEntityLookup[objective];
    return components.CompletedObjective.getWithKeys({ entity: player as Hex, objective: entity as Hex })?.value;
  });
}
