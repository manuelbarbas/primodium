import { EObjectives } from "contracts/config/enums";
import { toast } from "react-toastify";

import { Core, getEntityTypeName, ObjectiveEntityLookup } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";

import { canShowObjective } from "./objectiveRequirements";

export function makeObjectiveClaimable(core: Core, playerEntity: Entity, objective: EObjectives) {
  const objectiveEntity = ObjectiveEntityLookup[objective];
  const { tables } = core;
  const hasCompletedObjective = tables.CompletedObjective.getWithKeys({
    objective: objectiveEntity,
    entity: playerEntity,
  })?.value;

  const hasClaimedObjective = tables.IsObjectiveClaimable.get(objectiveEntity);
  if (hasCompletedObjective || hasClaimedObjective) return;

  tables.IsObjectiveClaimable.set({ value: true }, objectiveEntity);

  const objectiveShown = canShowObjective(core, playerEntity, objectiveEntity);
  //TODO: Use notify here once core package is implemented
  if (objectiveShown)
    toast.success(`You completed ${getEntityTypeName(objectiveEntity)}! Go to Objectives to claim your reward.`);
}
