import { EntityID } from "@latticexyz/recs";
import {
  P_ResourceReward,
  P_UnitReward,
} from "src/network/components/chainComponents";
import { RewardType } from "./constants";

export function getRewards(entityId: EntityID) {
  const rawResourceRewards = P_ResourceReward.get(entityId, {
    resources: [],
    values: [],
  });

  const rawUnitRewards = P_UnitReward.get(entityId, {
    resources: [],
    values: [],
  });

  const resourceRewards = rawResourceRewards.resources.map(
    (resource, index) => ({
      id: resource,
      type: RewardType.Resource,
      amount: rawResourceRewards.values[index],
    })
  );

  const unitRewards = rawUnitRewards.resources.map((resource, index) => ({
    id: resource,
    type: RewardType.Unit,
    amount: rawUnitRewards.values[index],
  }));

  return [...resourceRewards, ...unitRewards];
}
