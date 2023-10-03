import { EntityID } from "@latticexyz/recs";
import { P_ResourceReward, P_UnitReward } from "src/network/components/chainComponents";
import { ResourceType } from "./constants";

export function getRewards(entityId: EntityID) {
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
    type: ResourceType.Resource,
    amount: rawResourceRewards.requiredAmounts[index],
  }));

  const unitRewards = rawUnitRewards.resourceIDs.map((resource, index) => ({
    id: resource,
    type: ResourceType.Utility,
    amount: rawUnitRewards.requiredAmounts[index],
  }));

  return [...resourceRewards, ...unitRewards];
}
