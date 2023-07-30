import { EntityID } from "@latticexyz/recs";
import { RequiredResources } from "src/network/components/chainComponents";

export type ResourceCostData = {
  name: string;
  id: EntityID;
  description?: string;
  resources: {
    id: EntityID;
    amount: number;
  }[];
};

// building a building requires resources
// fetch directly from component data
export function getRecipe(entityId: EntityID): ResourceCostData["resources"] {
  const requiredResources = RequiredResources.get(entityId)?.resources;

  if (!requiredResources) return [];
  return requiredResources.map((resourceId: EntityID, index: number) => {
    // remove leading zeros due to mudv1 hashing behavior
    const resourceCost = RequiredResources.get(entityId)?.values[index];

    return {
      id: resourceId,
      amount: resourceCost ? parseInt(resourceCost.toString()) : -1,
    };
  });
}
