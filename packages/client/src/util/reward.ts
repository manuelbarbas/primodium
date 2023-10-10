import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { ResourceCategory } from "./constants";

export function getRewards(entityId: Entity) {
  const { P_ResourceReward, P_UnitReward } = components;
  const rawResourceRewards = P_ResourceReward.get(entityId, {
    resourceIDs: [],
    requiredAmounts: [],
  });

  const rawUnitRewards = P_UnitReward.get(entityId, {
    resourceIDs: [],
    requiredAmounts: [],
  });

  const resourceRewards = rawResourceRewards.resourceIDs.map((resource, index) => ({
    id: resource,
    type: ResourceCategory.Resource,
    amount: rawResourceRewards.requiredAmounts[index],
  }));

  const unitRewards = rawUnitRewards.resourceIDs.map((resource, index) => ({
    id: resource,
    type: ResourceCategory.Utility,
    amount: rawUnitRewards.requiredAmounts[index],
  }));

  return [...resourceRewards, ...unitRewards];
}
