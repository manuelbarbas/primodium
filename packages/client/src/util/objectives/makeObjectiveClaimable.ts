import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { getEntityTypeName } from "../common";
import { ObjectiveEntityLookup } from "../constants";
import { canShowObjective } from "./objectiveRequirements";

export function makeObjectiveClaimable(playerEntity: Entity, objective: EObjectives) {
  const objectiveEntity = ObjectiveEntityLookup[objective];
  const hasCompletedObjective = components.CompletedObjective.get(objectiveEntity)?.value;
  const hasClaimedObjective = components.IsObjectiveClaimable.get(objectiveEntity);
  if (hasCompletedObjective || hasClaimedObjective) return;

  components.IsObjectiveClaimable.set({ value: true }, objectiveEntity);

  const objectiveShown = canShowObjective(playerEntity, objectiveEntity);
  if (objectiveShown)
    toast.success(`You completed ${getEntityTypeName(objectiveEntity)}! Go to Objectives to claim your reward.`);
}
